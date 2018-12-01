import { videos } from '../data'
import { createLogger } from '../logger'
import { Speedrun } from '../model'
import { Job } from './job'

const logger = createLogger('video')

export class SpeedrunVideoUpdateJob implements Job {
  async start() {
    logger.debug('starting video update job...')

    for (const gid in videos) {
      logger.info(`updating vod of ${gid}`)

      await Speedrun.updateOne({ gid }, { vod: videos[gid] })
    }

    logger.debug('job done.')
  }
}
