import { BaseQueue } from './base.queue';
import { INotificationJobData } from '@notification/interfaces/notification.interface';
import { notificationWorker } from '@worker/notification.worker';

class NotificationQueue extends BaseQueue {
  constructor() {
    super('notificationQueue');
    this.processJob('markNotificationAsSeen', 5, notificationWorker.markNotificationAsSeen);
    this.processJob('deleteNotificationInDB', 5, notificationWorker.deleteNotificationInDB);
  }

  public addNotificationJob(name: string, data: INotificationJobData) {
    this.addJob(name, data);
  }
}

export const notificationQueue: NotificationQueue = new NotificationQueue();
