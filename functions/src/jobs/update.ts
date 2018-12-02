import { videos } from '../data'
import { createLogger } from '../logger'
import {
  GameInfo,
  SpeedrunByBackground,
  SpeedrunByGod,
  SpeedrunByPlayer,
} from '../model'
import { Job } from './job'

const logger = createLogger('video')

export class GameInfoVideUpdateJob implements Job {
  async start() {
    logger.debug('starting video update job...')

    for (const gid in videos) {
      logger.info(`updating vod of ${gid}`)

      await GameInfo.updateOne({ gid }, { vod: videos[gid] }, { upsert: false })
      await SpeedrunByBackground.updateOne(
        { gid },
        { vod: videos[gid] },
        { upsert: false }
      )
      await SpeedrunByGod.updateOne(
        { gid },
        { vod: videos[gid] },
        { upsert: false }
      )
      await SpeedrunByPlayer.updateOne(
        { gid },
        { vod: videos[gid] },
        { upsert: false }
      )
      await SpeedrunByBackground.updateOne(
        { gid },
        { vod: videos[gid] },
        { upsert: false }
      )
    }

    logger.debug('job done.')
  }
}
