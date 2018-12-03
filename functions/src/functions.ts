import { ApolloServer } from 'apollo-server-azure-functions'
import * as mongoose from 'mongoose'
import { schema } from './graphql'
import { GameInfoSyncJob, GameInfoVideUpdateJob } from './jobs'
import { ComboHighscoreSyncJob } from './jobs/sync'
import { createLogger } from './logger'
import { AggregationType } from './model'
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
    return logger.info('skipping sync on development environment')
  }

  logger.info(`starting sync iteration: ${iteration}`)

  const [sequell] = await Promise.all([ensureSequell(), ensureMongoose()])

  const playerLimit = 25

  switch (iteration) {
    case 0:
      return await new GameInfoSyncJob(sequell, {
        aggregations: [AggregationType.Player],
        playerLimit,
        filters: {
          min: 'dur',
        },
      }).start()
    case 1:
      return await new GameInfoSyncJob(sequell, {
        aggregations: [AggregationType.Background],
        playerLimit,
        filters: {
          min: 'dur',
        },
      }).start()
    case 2:
      return await new GameInfoSyncJob(sequell, {
        aggregations: [AggregationType.Race],
        playerLimit,
        filters: {
          min: 'dur',
        },
      }).start()
    case 3:
      return await new GameInfoSyncJob(sequell, {
        aggregations: [AggregationType.God],
        playerLimit,
        filters: {
          min: 'dur',
        },
      }).start()
    case 4:
      return await new GameInfoSyncJob(sequell, {
        aggregations: [AggregationType.Player],
        playerLimit,
        filters: {
          min: 'turns',
        },
      }).start()
    case 5:
      return await new GameInfoSyncJob(sequell, {
        aggregations: [AggregationType.Player],
        playerLimit,
        filters: {
          max: 'score',
        },
      }).start()
    case 6:
      return await new GameInfoSyncJob(sequell, {
        playerLimit,
        aggregations: [AggregationType.Player],
        filters: {
          min: 'dur',
          urune: 15,
        },
      }).start()
    case 7:
      return await new GameInfoVideUpdateJob().start()
    case 8:
      return await new ComboHighscoreSyncJob().start()
    default:
      return await Promise.resolve()
  }
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
