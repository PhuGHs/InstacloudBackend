import { config } from '@root/config';
import { reactionService } from '@service/db/reaction.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('reactionWorker');
class ReactionWorker {
  public async addPostReactionToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job;
      await reactionService.addPostReactionToDB(data);
      job.progress(100);
      done(null, job.data);
    } catch(error) {
      log.error(error);
      done(error as Error);
    }
  }

  public async addCommentReactionToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job;
      await reactionService.addCommentReactionToDB(data);
      job.progress(100);
      done(null, job.data);
    } catch(error) {
      log.error(error);
      done(error as Error);
    }
  }

  public async removePostReactionFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job;
      await reactionService.removeReactionFromCache(data);
      job.progress(100);
      done(null, job.data);
    } catch(error) {
      log.error(error);
      done(error as Error);
    }
  }

  public async removeCommentReactionFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job;
      await reactionService.removeCommentReactionFromCache(data);
      job.progress(100);
      done(null, job.data);
    } catch(error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const reactionWorker: ReactionWorker = new ReactionWorker();
