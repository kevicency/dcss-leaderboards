import { createLogger } from '../logger'
import {
  AggregationField,
  GameInfo,
  GameInfoAggregations,
  getAggregationFieldName,
  Speedruns,
} from '../model'
import { Job } from './job'

const logger = createLogger('aggregate')

export class SpeedrunRankingsAggregateJob implements Job {
  public types: AggregationField[]
  public limit: number

  constructor(args: { limit?: number; types?: AggregationField[] } = {}) {
    this.limit = args.limit
    this.types = args.types || [
      AggregationField.Player,
      AggregationField.Race,
      AggregationField.Background,
      AggregationField.God,
    ]
  }

  start(): Promise<any> {
    logger.debug('starting job...')

    return this.types
      .reduce((memo, type) => {
        const field = getAggregationFieldName(type)
        const aggregate = async () => {
          logger.debug(`running aggregation for ${field}`)

          const collection = Speedruns[type].collection
          logger.debug(`dropping collection ${collection.name}`)

          try {
            await collection.drop()
          } catch (err) {
            logger.debug(`collection ${collection.name} did not exist`)
            /* ignore */
          }

          const aggregations = GameInfoAggregations.aggregateSpeedrunBy(
            field,
            type === AggregationField.Player ? this.limit : null
          )

          console.log(aggregations)

          await GameInfo.aggregate(aggregations).exec()
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
