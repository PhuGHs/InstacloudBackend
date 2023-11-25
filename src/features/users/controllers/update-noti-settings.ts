import { joiValidation } from '@global/decorators/joi.validation';
import { userQueue } from '@service/queues/user.queue';
import { UserCache } from '@service/redis/user.cache';
import { notificationSettingsSchema } from '@user/schemes/user.scheme';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';

const userCache: UserCache = new UserCache();
export class NotificationSettings {
  @joiValidation(notificationSettingsSchema)
  public async notification(req: Request, res: Response): Promise<void> {
    await userCache.updateSingleItemInCache(req.currentUser!.userId, 'notifications', req.body);
    userQueue.addUserJob('updateNotificationSettings', {
      key: req.currentUser!.userId,
      value: req.body
    });
    res.status(STATUS_CODE.OK).json({ message: 'update notification settings succesfully!'});
  }
}
