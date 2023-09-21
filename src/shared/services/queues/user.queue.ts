import { IAuthJob } from '@root/features/auth/interfaces/auth.interface';
import { BaseQueue } from './base.queue';
import { userWorker } from '@root/shared/workers/user.worker';

class UserQueue extends BaseQueue {
  constructor() {
    super('user');
    this.processJob('addUserToDB', 5, userWorker.addUserToDB);
  }

  public addUserJob(name: string, data: IAuthJob) {
    this.addJob(name, data);
  }
}

export const userQueue: UserQueue = new UserQueue();
