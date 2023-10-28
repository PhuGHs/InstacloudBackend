import { config } from '@root/config';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { followerService } from '@service/db/follower.service';
import { blockService } from '@service/db/block.service';

const log: Logger = config.createLogger('blockWorker');
class BlockWorker {
  async addBlockedUserToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo, type } = job.data;
      if (type === 'block') {
        await blockService.blockUserInDB(keyOne, keyTwo);
      } else {
        await blockService.unblockUserInDB(keyOne, keyTwo);
      }
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const blockWorker: BlockWorker = new BlockWorker();
