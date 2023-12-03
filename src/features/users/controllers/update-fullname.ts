import STATUS_CODES from 'http-status-codes';
import { userQueue } from '@service/queues/user.queue';
import { UserCache } from '@service/redis/user.cache';
import { Request, Response } from 'express';

const userCache: UserCache = new UserCache();
export class UpdateFullName {
  public async fullname(req: Request, res: Response): Promise<void> {
    const { firstname, lastname } =  req.body;
    const fullname = firstname + ' ' + lastname;
    await userCache.updateSingleItemInCache(req.currentUser!.userId, 'fullname', fullname);
    userQueue.addUserJob('updateFullname', {
      key: req.currentUser!.userId,
      value: fullname
    });
    res.status(STATUS_CODES.OK).json({ message: 'update succesfully'});
  }
}
