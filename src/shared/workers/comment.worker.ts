import { config } from '@root/config';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { userService } from '@service/db/user.service';
import { commentService } from '../services/db/comment.service';

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
}

export const commentWorker: CommentWorker = new CommentWorker();
