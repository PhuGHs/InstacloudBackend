import { BaseQueue } from './base.queue';
import { blockWorker } from '@worker/block.worker';
import { IBlockedUserJobData } from '@follower/interfaces/follower.interface';

class BlockQueue extends BaseQueue {
  constructor() {
    super('block');
    this.processJob('addBlockedUserToDB', 5, blockWorker.addBlockedUserToDB);
  }

  public addAuthUserJob(name: string, data: IBlockedUserJobData) {
    this.addJob(name, data);
  }
}

export const blockQueue: BlockQueue = new BlockQueue();
