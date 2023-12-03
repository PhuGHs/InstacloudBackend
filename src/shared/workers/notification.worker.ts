import { config } from '@root/config';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { notificationService } from '@service/db/notification.service';

const log: Logger = config.createLogger('notificationWorker');
class NotificationWorker {
  async markNotificationAsSeen(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key } = job.data;
      await notificationService.markNotificationAsSeen(key);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async deleteNotificationInDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key } = job.data;
      await notificationService.deleteNotificationFromDB(key);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const notificationWorker: NotificationWorker = new NotificationWorker();
