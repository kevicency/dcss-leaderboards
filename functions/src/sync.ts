import * as mongoose from 'mongoose'
import {
  SpeedrunRankingsAggregateJob,
  SpeedrunSequellSyncJob,
  SpeedrunVideoUpdateJob,
} from './jobs'
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

  const limit = 25
  const jobs = [
    new SpeedrunSequellSyncJob(sequell, {
      // flags: SpeedrunSyncJobFlags.Players,
      playerLimit: limit,
    }),
    new SpeedrunRankingsAggregateJob({
      // types: [RankingType.Player],
      limit,
    }),
    new SpeedrunVideoUpdateJob(),
  ]

  return (
    jobs
      // .slice(1, 2)
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
