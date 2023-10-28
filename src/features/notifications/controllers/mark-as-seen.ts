import { notificationQueue } from '@service/queues/notification.queue';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';

export class Update {
  public async notification(req: Request, res: Response): Promise<void> {
    const { notificationId } = req.params;
    notificationQueue.addNotificationJob('markNotificationAsSeen', { key: notificationId });
    res.status(STATUS_CODE.OK).json({ message: 'The notification has been marked as read!' });
  }
}
