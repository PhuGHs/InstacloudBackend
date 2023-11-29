import { IAuthJob } from '@root/features/auth/interfaces/auth.interface';
import { BaseQueue } from './base.queue';
import { userWorker } from '@root/shared/workers/user.worker';
import { IUserJob } from '@user/interfaces/user.interface';

class UserQueue extends BaseQueue {
  constructor() {
    super('user');
    this.processJob('addUserToDB', 5, userWorker.addUserToDB);
    this.processJob('updateNotiSettings', 5, userWorker.updateNotiSettings);
    this.processJob('updateBackgroundInformation', 5, userWorker.updateBackgroundInformation);
    this.processJob('updateSocialLinks', 5, userWorker.updateSocialLinks);
  }

  public addUserJob(name: string, data: IAuthJob | IUserJob) {
    this.addJob(name, data);
  }
}

export const userQueue: UserQueue = new UserQueue();
