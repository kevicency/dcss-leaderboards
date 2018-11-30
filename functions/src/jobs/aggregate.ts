import { createLogger } from '../logger'
import {
  Rankings,
  RankingType,
  rankingTypeToField,
  Speedrun,
  SpeedrunAggregations,
} from '../model'
import { Job } from './job'

const logger = createLogger('aggregate')

export class SpeedrunRankingsAggregateJob implements Job {
  public types: RankingType[]
  public limit: number

  constructor(args: { limit?: number; types?: RankingType[] } = {}) {
    this.limit = args.limit
    this.types = args.types || [
      RankingType.Player,
      RankingType.Race,
      RankingType.Background,
      RankingType.God,
    ]
  }

  start(): Promise<any> {
    logger.debug('starting job...')

    return this.types
      .reduce((memo, type) => {
        const field = rankingTypeToField(type)
        const aggregate = async () => {
          logger.debug(`running aggregation for ${field}`)

          const collection = Rankings[type].collection
          logger.debug(`dropping collection ${collection.name}`)

          try {
            await collection.drop()
          } catch (err) {
            logger.debug(`collection ${collection.name} did not exist`)
            /* ignore */
          }

          const aggregations = SpeedrunAggregations.generateRankingsBy(
            field,
            type === RankingType.Player ? this.limit : null
          )

          console.log(aggregations)

          await Speedrun.aggregate(aggregations).exec()
          logger.debug(`aggregations for ${field} done.`)

          return
        }

        return memo.then(aggregate)
      }, Promise.resolve())
      .then(() => {
        logger.debug('job done.')
      })
  }
}
