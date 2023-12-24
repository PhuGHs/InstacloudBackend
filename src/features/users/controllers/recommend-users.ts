import { userService } from '@service/db/user.service';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Request, Response } from 'express';
import STATUS_CODES from 'http-status-codes';
import mongoose from 'mongoose';

const userCache: UserCache = new UserCache();
export class Recommendation {
  public async users(req: Request, res: Response): Promise<void> {
    const cachedUser: IUserDocument = (await userCache.getUserFromCache(req.currentUser!.userId)) as IUserDocument;
    const user: IUserDocument = cachedUser ? cachedUser : await userService.getUserById(req.currentUser!.userId);

    const userIds: mongoose.Types.ObjectId[] = [];
    for (const blockedUser of [...user.blocked, ...user.blockedBy]) {
      userIds.push(new mongoose.Types.ObjectId(blockedUser));
    }
    const users: IUserDocument[] = await userService.recommendUsers(req.currentUser!.userId, userIds);
    res.status(STATUS_CODES.OK).json({ message: 'users recommendation', users });
  }
}
