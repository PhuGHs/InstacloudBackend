import { config } from '@root/config';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { imageService } from '@service/db/image.service';

const log: Logger = config.createLogger('imageWorker');
class ImageWorker {
  async addImageToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      await imageService.addImageToDB(job.data);
      job.progress(100);
      done(null, job.data);
    } catch(error) {
      log.error(error);
      done(error as Error);
    }
  }

  async removeImageFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key } = job.data;
      await imageService.removeImageFromDB(key);
      job.progress(100);
      done(null, job.data);
    } catch(error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const imageWorker: ImageWorker = new ImageWorker();
