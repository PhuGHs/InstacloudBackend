import { config } from '@root/config';
import { IUserDocument } from '@root/features/users/interfaces/user.interface';
import { userService } from '@root/shared/services/db/user.service';
import { UserCache } from '@root/shared/services/redis/user.cache';
import Logger from 'bunyan';
import { Request, Response } from 'express';
import HTTP_CODE from 'http-status-codes';

const userCache: UserCache = new UserCache();
const log: Logger = config.createLogger('currentUser');
export class CurrentUser {
  public async information(req: Request, res: Response): Promise<void> {
    let isUser = false;
    let token = null;
    let user = null;

    const cachedUser: IUserDocument | null = await userCache.getUserFromCache(`${req.currentUser?.userId}`);
    log.info(cachedUser);
    const existingUser: IUserDocument = cachedUser ? cachedUser : await userService.getUserById(`${req.currentUser!.userId}`);

    if (Object.keys(existingUser).length) {
      isUser = true;
      token = req.session?.jwt;
      user = existingUser;
    }

    res.status(HTTP_CODE.OK).json({ token, isUser, user });
  }
}
