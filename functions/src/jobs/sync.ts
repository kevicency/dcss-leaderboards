import { EventEmitter } from 'events'
import { noop, Omit, values } from 'lodash'
import * as data from '../data'
import { createLogger } from '../logger'
import { AggregationField, ComboHighscore, GameInfo } from '../model'
import { Scraper, WebScraper } from '../scraper'
import { lgQuery, Sequell, SequellResult } from '../sequell'
import { Job } from './job'

const logger = createLogger('sync')

export class GameInfoSyncJobQueue {
  public races: string[] = [...data.races]
  public backgrounds: string[] = [...data.backgrounds]
  public gods: string[] = [...data.godKeywords]
  public topPlayers: string[] = []
}
export interface GameInfoSyncJobOptions {
  onError?(err: any): void
  onTimeout?(query: any): void
  onFinished?(): void
  delay?: number
  timeout?: number
  playerLimit?: number
  aggregations?: AggregationField[]
}

export class GameInfoSyncJob implements Job {
  private $resolve: any
  private sequell: Sequell
  private queue: GameInfoSyncJobQueue
  private emitter: EventEmitter
  private tid: NodeJS.Timeout
  private aggregations: AggregationField[]
  private killedMessages: string[] = []
  public playerLimit: number

  public delay: number
  public timeout: number

  constructor(
    sequell: Sequell,
    {
      onError,
      onTimeout,
      onFinished,
      delay,
      timeout,
      playerLimit,
      aggregations,
    }: GameInfoSyncJobOptions = {}
  ) {
    this.sequell = sequell
    this.delay = delay || 1000
    this.timeout = timeout || 95000
    this.playerLimit = playerLimit || 10
    this.aggregations =
      aggregations || (values(AggregationField) as AggregationField[])
    this.queue = new GameInfoSyncJobQueue()
    this.emitter = new EventEmitter()
    this.emitter.on('timeout', onTimeout || noop)
    this.emitter.on('error', onError || noop)
    if (onFinished) {
      this.emitter.on('done', onFinished)
    }
  }

  public start() {
    logger.info('starting job...')

    this.killedMessages = []

    this.sequell.on('result', this.processResult)

    this.processResult({ type: 'init' })

    return new Promise<void>(this.bindPromise)
  }

  processResult = async (
    result: SequellResult | { type: 'timeout' | 'init' }
  ): Promise<void> => {
    const { queue } = this

    logger.debug('proccess queue', result)

    if (this.tid && (result.type === 'lg' || result.type === 'killed')) {
      clearTimeout(this.tid)
      this.tid = null
    }

    await this.persistSequellResult(result)

    if (result.type !== 'log') {
      switch (true) {
        case this.hasAggregation(AggregationField.Player) &&
          queue.topPlayers.length < this.playerLimit - 1:
          if (result && result.type === 'lg') {
            queue.topPlayers.push(result.player)
          }

          logger.debug(
            `processing top players: ${queue.topPlayers.length}/${
              this.playerLimit
            }.`
          )

          return this.next({
            min: 'dur',
            playerBlacklist: [...data.bots, ...queue.topPlayers],
          })
        case this.hasAggregation(AggregationField.Race) &&
          queue.races.length > 0:
          logger.debug(`processing races: ${queue.races.length} left.`)

          return this.next({
            min: 'dur',
            race: queue.races.shift(),
            playerBlacklist: [...data.bots],
          })
        case this.hasAggregation(AggregationField.Background) &&
          queue.backgrounds.length > 0:
          logger.debug(
            `processing backgrounds: ${queue.backgrounds.length} left.`
          )

          return this.next({
            min: 'dur',
            background: queue.backgrounds.shift(),
            playerBlacklist: [...data.bots],
          })
        case this.hasAggregation(AggregationField.God) && queue.gods.length > 0:
          logger.debug(`processing gods: ${queue.gods.length} left.`)

          return this.next({
            min: 'dur',
            god: queue.gods.shift(),
            playerBlacklist: [...data.bots],
          })
        default:
          if (result.type === 'killed') {
            if (this.killedMessages.indexOf(result.message) === -1) {
              logger.debug(`replaying killed message: ${result.message}`)
              this.killedMessages.push(result.message)
              return this.next(result.message)
            } else {
              return this.processResult({ type: 'timeout' })
            }
          }

          return this.done()
      }
    }
  }

  persistSequellResult = async (
    result: SequellResult | { type: 'timeout' | 'init' }
  ) => {
    if (result.type === 'lg') {
      try {
        logger.debug(`persisting game info: ${result.gid}`)

        const gameInfo = await GameInfo.findOneAndUpdate(
          { gid: result.gid },
          result,
          { upsert: true, setDefaultsOnInsert: true, new: true }
        )

        if (!gameInfo.get('morgue')) {
          this.sequell.log({ gid: result.gid })
        }
      } catch (err) {
        this.emitError(err)
      }

      logger.debug(`done persisting game info: ${result.gid}`)
    }

    if (result.type === 'log') {
      logger.debug(`persisting morgue: ${result.morgue}`)

      const { morgue, type, ...conditions } = result

      try {
        await GameInfo.updateOne(
          conditions,
          { morgue },
          { upsert: true, setDefaultsOnInsert: true }
        )
      } catch (err) {
        this.emitError(err)
      }

      logger.debug(`done persisting morgue: ${result.morgue}`)
    }
  }

  next = (query: Omit<lgQuery, 'type'> | string) => {
    logger.debug(`next: ${JSON.stringify(query)}`)

    const self = this

    setTimeout(() => {
      if (typeof query === 'string') {
        self.sequell.send(query)
      } else {
        self.sequell.lg(query)
      }
    }, this.delay)

    this.tid = setTimeout(() => {
      self.emitTimeout(query)
      self.processResult({ type: 'timeout' })
    }, this.delay + this.timeout)
  }

  private emitTimeout = (query: any) => {
    logger.warn(`query timeout: ${JSON.stringify(query)}`)

    this.emitter.emit('timeout', query)
  }
  private emitError = (err: any) => {
    logger.error(err)

    this.emitter.emit('error', err)
  }
  private done = () => {
    logger.info('job done.')

    this.sequell.removeListener('result', this.processResult)

    this.emitter.emit('done')

    if (this.$resolve) {
      this.$resolve()
      this.$resolve = null
    }
  }

  private bindPromise = (resolve: any) => {
    this.$resolve = resolve
  }

  private hasAggregation(field: AggregationField) {
    return this.aggregations.indexOf(field) !== -1
  }
}

export class ComboHighscoreSyncJob implements Job {
  private scraper: Scraper = new WebScraper()

  constructor(options: { scraper?: Scraper } = {}) {
    this.scraper = options.scraper || new WebScraper()
  }

  public async start() {
    logger.debug('starting combo highscore job...')
    const gameInfos = await this.scraper.fetchComboHighscores()

    logger.debug(`fetched ${gameInfos.length} game infos. Persisting...`)

    for (const gameInfo of gameInfos) {
      await ComboHighscore.updateOne(
        {
          gid: gameInfo.gid,
        },
        gameInfo,
        { upsert: true, setDefaultsOnInsert: true }
      )
    }
    logger.debug('combo highscore job done.')
  }
}
