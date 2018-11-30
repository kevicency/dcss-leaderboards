import { EventEmitter } from 'events'
import { noop, Omit } from 'lodash'
import * as data from '../data'
import { createLogger } from '../logger'
import { Speedrun } from '../model'
import { lgQuery, Sequell, SequellResult } from '../sequell'
import { Job } from './job'

const logger = createLogger('sync')

export enum SpeedrunSyncJobFlags {
  None = 0,
  Players = 1,
  Races = 2 << 0,
  Backgrounds = 2 << 1,
  Gods = 2 << 2,

  All = Players | Races | Backgrounds | Gods,
}

export class SpeedrunSyncJobQueue {
  public races: string[] = [...data.races]
  public backgrounds: string[] = [...data.backgrounds]
  public gods: string[] = [...data.godKeywords]
  public topPlayers: string[] = []
}
export interface SpeedrunSequellSyncJobOptions {
  onError?(err: any): void
  onTimeout?(query: any): void
  onFinished?(): void
  delay?: number
  timeout?: number
  playerLimit?: number
  flags?: SpeedrunSyncJobFlags
}

export class SpeedrunSequellSyncJob implements Job {
  private $resolve: any
  private sequell: Sequell
  private queue: SpeedrunSyncJobQueue
  private emitter: EventEmitter
  private tid: NodeJS.Timeout
  private flags: SpeedrunSyncJobFlags
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
      flags,
    }: SpeedrunSequellSyncJobOptions = {}
  ) {
    this.sequell = sequell
    this.delay = delay || 1000
    this.timeout = timeout || 95000
    this.playerLimit = playerLimit || 10
    this.flags = flags || SpeedrunSyncJobFlags.All
    this.queue = new SpeedrunSyncJobQueue()
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
        case this.hasFlag(SpeedrunSyncJobFlags.Players) &&
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
        case this.hasFlag(SpeedrunSyncJobFlags.Races) && queue.races.length > 0:
          logger.debug(`processing races: ${queue.races.length} left.`)

          return this.next({
            min: 'dur',
            race: queue.races.shift(),
            playerBlacklist: [...data.bots],
          })
        case this.hasFlag(SpeedrunSyncJobFlags.Backgrounds) &&
          queue.backgrounds.length > 0:
          logger.debug(
            `processing backgrounds: ${queue.backgrounds.length} left.`
          )

          return this.next({
            min: 'dur',
            background: queue.backgrounds.shift(),
            playerBlacklist: [...data.bots],
          })
        case this.hasFlag(SpeedrunSyncJobFlags.Gods) && queue.gods.length > 0:
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
        logger.debug(`persisting speedrun: ${result.gid}`)

        const speedrun = await Speedrun.findOneAndUpdate(
          { gid: result.gid },
          result,
          { upsert: true, setDefaultsOnInsert: true, new: true }
        )

        if (!speedrun.get('morgue')) {
          this.sequell.log({ gid: result.gid })
        }
      } catch (err) {
        this.emitError(err)
      }

      logger.debug(`done persisting speedrun: ${result.gid}`)
    }

    if (result.type === 'log') {
      logger.debug(`persisting morgue: ${result.morgue}`)

      const { morgue, type, ...conditions } = result

      try {
        await Speedrun.updateOne(
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

  private hasFlag(flag: SpeedrunSyncJobFlags) {
    return (this.flags & flag) === flag
  }
}
