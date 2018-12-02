import * as mongoose from 'mongoose'
import {
  GameInfoAggregationsJob,
  GameInfoSyncJob,
  GameInfoVideUpdateJob,
} from './jobs'
import { ComboHighscoreSyncJob } from './jobs/sync'
import { createLogger } from './logger'
import { IrcSequell, Sequell } from './sequell'
import { inSeries } from './utils'

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

  const limit = 10
  const jobs = [
    new GameInfoSyncJob(sequell, {
      skipMorgue: true,
      playerLimit: limit,
      playerAllRunes: true,
    }),
    new GameInfoAggregationsJob({
      limit,
    }),
    new GameInfoVideUpdateJob(),
    new ComboHighscoreSyncJob(),
  ]

  return inSeries(
    jobs.slice(1, 3).map(job => () =>
      job.start().catch(err => {
        logger.error(err)

        return Promise.resolve()
      })
    )
  )
}

if (/sync.ts$/.test(__filename)) {
  sync().then(() => process.exit(0))
}
