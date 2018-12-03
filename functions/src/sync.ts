import * as mongoose from 'mongoose'
import { GameInfoSyncJob, GameInfoVideUpdateJob } from './jobs'
import { ComboHighscoreSyncJob } from './jobs/sync'
import { createLogger } from './logger'
import { AggregationType } from './model'
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

  const limit = 5
  const skipMorgue = true
  const jobs = [
    new GameInfoSyncJob(sequell, {
      skipMorgue,
      aggregations: [AggregationType.Player, AggregationType.Background],
      playerLimit: limit,
      filters: {
        min: 'dur',
      },
    }),
    new GameInfoSyncJob(sequell, {
      skipMorgue,
      aggregations: [AggregationType.Player],
      playerLimit: limit,
      filters: {
        min: 'turns',
      },
    }),
    new GameInfoSyncJob(sequell, {
      skipMorgue,
      aggregations: [AggregationType.Player],
      playerLimit: limit,
      filters: {
        max: 'score',
      },
    }),

    // 15 rune players
    new GameInfoSyncJob(sequell, {
      skipMorgue,
      playerLimit: limit,
      aggregations: [AggregationType.Player],
      filters: {
        min: 'dur',
        urune: 15,
      },
    }),

    new GameInfoVideUpdateJob(),
    new ComboHighscoreSyncJob(),
  ]

  return inSeries(
    jobs.map(job => () =>
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
