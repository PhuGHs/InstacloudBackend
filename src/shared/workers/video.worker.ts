import { config } from '@root/config';
import { videoService } from '@service/db/video.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('videoWorker');
class VideoWorker {
  async removeVideoFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data;
      await videoService.removeVideo(key, value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async addVideoToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data;
      await videoService.addVideo(value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const videoWorker: VideoWorker = new VideoWorker();
