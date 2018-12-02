import * as mongoose from 'mongoose'
import {
  GameInfoAggregationsJob,
  GameInfoSyncJob,
  GameInfoVideUpdateJob,
} from './jobs'
import { ComboHighscoreSyncJob } from './jobs/sync'
import { createLogger } from './logger'
import { IrcSequell, Sequell } from './sequell'

const settings: any = require('../local.settings.json')
Object.assign(process.env, settings.Values)

const logger = createLogger('sync')

async function sync() {
  const [sequell] = await Promise.all([
    new Promise<Sequell>(resolve => {
      const sequell = new IrcSequell()
      sequell.on('ready', () => resolve(sequell))
    }),
    new Promise<void>((resolve, reject) =>
      mongoose.connect(
        process.env.MONGODB,
        { useNewUrlParser: true },
        err => {
          if (err) {
            logger.error(err)
            reject(err)
          } else {
            resolve()
          }
        }
      )
    ),
  ])

  const limit = 25
  const jobs = [
    new GameInfoSyncJob(sequell, {
      playerLimit: limit,
    }),
    new GameInfoAggregationsJob({
      limit,
    }),
    new GameInfoVideUpdateJob(),
    new ComboHighscoreSyncJob(),
  ]

  return (
    jobs
      // .slice(3, 4)
      // .slice(2, 3)
      .reduce(
        (promise, job) => promise.then(job.start.bind(job)),
        Promise.resolve()
      )
  )
}

if (/sync.ts$/.test(__filename)) {
  sync().then(() => process.exit(0))
}
