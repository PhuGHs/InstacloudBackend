import { config } from '@root/config';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { commentService } from '@service/db/comment.service';

const log: Logger = config.createLogger('commentWorker');
class CommentWorker {
  async addCommentToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job;
      await commentService.addCommentToDB(data);
      job.progress(100);
      done(null, data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async updateACommentInDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data;
      await commentService.updateACommentInDB(key, value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async deleteACommentInDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo } = job.data;
      await commentService.deleteACommentInDB(keyOne, keyTwo);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const commentWorker: CommentWorker = new CommentWorker();
