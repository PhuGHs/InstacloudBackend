import { BaseQueue } from './base.queue';
import { followerWorker } from '@worker/follower.worker';
import { IFollowerJobData } from '@follower/interfaces/follower.interface';
import { INotificationJobData } from '@notification/interfaces/notification.interface';
import { notificationWorker } from '@worker/notification.worker';

class NotificationQueue extends BaseQueue {
  constructor() {
    super('notificationQueue');
    this.processJob('markNotificationAsSeen', 5, notificationWorker.markNotificationAsSeen);
  }

  public addNotificationJob(name: string, data: INotificationJobData) {
    this.addJob(name, data);
  }
}

export const notificationQueue: NotificationQueue = new NotificationQueue();
