import { ApolloServer } from 'apollo-server-azure-functions'
import * as mongoose from 'mongoose'
import { schema } from './graphql'
import {
  Job,
  SpeedrunRankingsAggregateJob,
  SpeedrunSequellSyncJob,
} from './jobs'
import { SpeedrunSyncJobFlags } from './jobs/sync'
import { createLogger } from './logger'
import { RankingType } from './model'
import { IrcSequell, Sequell } from './sequell'

const logger = createLogger('functions')

const ensureSequell = () =>
  new Promise<Sequell>(resolve => {
    const sequell = new IrcSequell()

    sequell.on('ready', () => resolve(sequell))
  })

const ensureMongoose = () =>
  new Promise<mongoose.Connection>((resolve, reject) =>
    mongoose.connect(
      process.env.MONGODB,
      { useNewUrlParser: true },
      err => {
        if (err) {
          logger.error(err)
          reject(err)
        } else {
          resolve(mongoose.connection)
        }
      }
    )
  )

export async function sync(iteration: number, force = false) {
  if (process.env.NODE_ENV !== 'production' && !force) {
    return logger.info('skipping sync on development evnironment')
  }

  const [sequell] = await Promise.all([ensureSequell(), ensureMongoose()])

  const playerLimit = 25
  const jobIterations: Job[][] = [
    [
      new SpeedrunSequellSyncJob(sequell, {
        flags: SpeedrunSyncJobFlags.Players,
        playerLimit,
      }),
      new SpeedrunRankingsAggregateJob({
        types: [RankingType.Player],
        limit: playerLimit,
      }),
    ],
    [
      new SpeedrunSequellSyncJob(sequell, {
        flags: SpeedrunSyncJobFlags.Races,
      }),
      new SpeedrunRankingsAggregateJob({ types: [RankingType.Race] }),
    ],
    [
      new SpeedrunSequellSyncJob(sequell, {
        flags: SpeedrunSyncJobFlags.Backgrounds,
      }),
      new SpeedrunRankingsAggregateJob({ types: [RankingType.Background] }),
    ],
    [
      new SpeedrunSequellSyncJob(sequell, {
        flags: SpeedrunSyncJobFlags.Gods,
      }),
      new SpeedrunRankingsAggregateJob({ types: [RankingType.God] }),
    ],
  ]

  const jobs = jobIterations[iteration % jobIterations.length] || []

  return jobs.reduce(
    (promise, job) =>
      promise.then(() =>
        job.start().catch(err => {
          logger.error(err)
          return Promise.reject(err)
        })
      ),
    Promise.resolve()
  )
}

export function graphQL() {
  const server = new ApolloServer({ schema })
  const handler = server.createHandler()
  const mongoPromise = ensureMongoose()

  return function(context: any, req: any) {
    mongoPromise.then(() => handler(context, req))
  }
}
