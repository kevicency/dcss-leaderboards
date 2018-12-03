import { ApolloServer } from 'apollo-server-azure-functions'
import { values } from 'lodash'
import * as mongoose from 'mongoose'
import { schema } from './graphql'
import { GameInfoSyncJob } from './jobs'
import { createLogger } from './logger'
import { AggregationType } from './model'
import { IrcSequell, Sequell } from './sequell'
import { inSeries } from './utils'

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

export async function sync(aggregationIndex: number, force = false) {
  if (process.env.NODE_ENV !== 'production' && !force) {
    return logger.info('skipping sync on development evnironment')
  }

  const [sequell] = await Promise.all([ensureSequell(), ensureMongoose()])

  const playerLimit = 25
  const aggregationTypes = values(AggregationType) as AggregationType[]
  const aggregationType =
    aggregationTypes[aggregationIndex % aggregationTypes.length]

  const jobs = [
    new GameInfoSyncJob(sequell, {
      aggregations: [aggregationType],
      playerLimit:
        aggregationType === AggregationType.Player ? playerLimit : undefined,
    }),
  ]

  return inSeries(
    jobs.map(job => () =>
      job.start().catch(err => {
        logger.error(err)
        return Promise.reject(err)
      })
    )
  )
}

export function graphQL() {
  const server = new ApolloServer({
    schema,
    introspection: true,
    playground: true,
  })
  const handler = server.createHandler()
  const mongoPromise = ensureMongoose()

  return function(context: any, req: any) {
    mongoPromise.then(() => handler(context, req))
  }
}
