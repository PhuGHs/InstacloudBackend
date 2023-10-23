import { INotificationDocument } from '@notification/interfaces/notification.interface';
import { notificationService } from '@service/db/notification.service';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';

export class Get {
  public async notification(req: Request, res: Response): Promise<void> {
    const notification: INotificationDocument[] =  await notificationService.getNotification(req.currentUser!.userId);
    res.status(STATUS_CODE.OK).json({message: 'notification of user', notification });
  }
}
