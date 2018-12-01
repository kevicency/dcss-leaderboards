import { videos } from '../data'
import { createLogger } from '../logger'
import {
  RankingByBackground,
  RankingByGod,
  RankingByPlayer,
  RankingByRace,
  Speedrun,
} from '../model'
import { Job } from './job'

const logger = createLogger('video')

export class SpeedrunVideoUpdateJob implements Job {
  async start() {
    logger.debug('starting video update job...')

    for (const gid in videos) {
      logger.info(`updating vod of ${gid}`)

      await Speedrun.updateOne({ gid }, { vod: videos[gid] }, { upsert: false })
      await RankingByBackground.updateOne(
        { gid },
        { vod: videos[gid] },
        { upsert: false }
      )
      await RankingByGod.updateOne(
        { gid },
        { vod: videos[gid] },
        { upsert: false }
      )
      await RankingByPlayer.updateOne(
        { gid },
        { vod: videos[gid] },
        { upsert: false }
      )
      await RankingByRace.updateOne(
        { gid },
        { vod: videos[gid] },
        { upsert: false }
      )
    }

    logger.debug('job done.')
  }
}
