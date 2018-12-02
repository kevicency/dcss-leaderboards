import { createLogger } from '../logger'
import {
  AggregationField,
  GameInfo,
  GameInfoAggregations,
  Speedruns,
} from '../model'
import { Job } from './job'

const logger = createLogger('aggregate')

export class GameInfoAggregationsJob implements Job {
  public aggregations: AggregationField[]
  public limit: number

  constructor(
    args: { limit?: number; aggregations?: AggregationField[] } = {}
  ) {
    this.limit = args.limit
    this.aggregations = args.aggregations || [
      AggregationField.Player,
      AggregationField.Player15Runes,
      AggregationField.Race,
      AggregationField.Background,
      AggregationField.God,
    ]
  }

  start(): Promise<any> {
    logger.debug('starting job...')

    return this.aggregations
      .reduce((memo, aggregrationType) => {
        const aggregate = async () => {
          logger.debug(`running aggregation for ${aggregrationType}`)

          const speedruns = Speedruns[aggregrationType].collection
          logger.debug(`dropping collection ${speedruns.name}`)

          try {
            await speedruns.drop()
          } catch (err) {
            logger.debug(`collection ${speedruns.name} did not exist`)
            /* ignore */
          }

          const aggregations = GameInfoAggregations.aggregateSpeedrunBy(
            aggregrationType,
            aggregrationType === AggregationField.Player ? this.limit : null
          )

          await GameInfo.aggregate(aggregations).exec()
          logger.debug(`aggregations for ${aggregrationType} done.`)

          return
        }

        return memo.then(aggregate)
      }, Promise.resolve())
      .then(() => {
        logger.debug('job done.')
      })
  }
}
