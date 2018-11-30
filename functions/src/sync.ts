import * as mongoose from 'mongoose'
import { SpeedrunRankingsAggregateJob, SpeedrunSequellSyncJob } from './jobs'
import { SpeedrunSyncJobFlags } from './jobs/sync'
import { createLogger } from './logger'
import { IrcSequell, Sequell } from './sequell'

const settings: any = require('../local.settings.json')
Object.assign(process.env, settings.Values)

const logger = createLogger('sync')

async function sync(force: boolean = false) {
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
    new SpeedrunSequellSyncJob(sequell, {
      flags: SpeedrunSyncJobFlags.Players,
      playerLimit: limit,
    }),
    new SpeedrunRankingsAggregateJob({
      limit,
    }),
  ]

  return jobs
    .slice(1, 2)
    .reduce(
      (promise, job) => promise.then(job.start.bind(job)),
      Promise.resolve()
    )
}

if (/sync.ts$/.test(__filename)) {
  sync().then(() => process.exit(0))
}
