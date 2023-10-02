import { IEmailJob } from '@root/features/users/interfaces/user.interface';
import { BaseQueue } from './base.queue';
import { emailWorker } from '@root/shared/workers/email.worker';

class EmailQueue extends BaseQueue {
  constructor() {
    super('email');
    this.processJob('forgotPassword', 5, emailWorker.addNotificationEmail);
  }

  public addEmailJob(name: string, data: IEmailJob): void {
    this.addJob(name, data);
  }
}

export const emailQueue: EmailQueue = new EmailQueue();
