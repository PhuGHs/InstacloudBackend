import { notificationQueue } from '@service/queues/notification.queue';
import { socketIONotificationObject } from '@socket/notification.socket';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';

export class Update {
  public async notification(req: Request, res: Response): Promise<void> {
    const { notificationId } = req.params;
    socketIONotificationObject.emit('mark as seen', notificationId);
    notificationQueue.addNotificationJob('markNotificationAsSeen', { key: notificationId });
    res.status(STATUS_CODE.OK).json({ message: 'The notification has been marked as read!' });
  }
}
