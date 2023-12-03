import { blockQueue } from '@service/queues/block.queue';
import { FollowerCache } from '@service/redis/follower.cache';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';

const followerCache: FollowerCache = new FollowerCache();
export class Update {
  public async blockUser(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;
    await followerCache.updateBlockedUserInCache(req.currentUser!.userId, 'blocked', followerId, 'block');
    await followerCache.updateBlockedUserInCache(followerId, 'blockedBy', req.currentUser!.userId, 'block');

    blockQueue.addAuthUserJob('addBlockedUserToDB', {
      keyOne: req.currentUser!.userId,
      keyTwo: followerId,
      type: 'block'
    });
    res.status(STATUS_CODE.OK).json({ message: 'blocked user!' });
  }

  public async unblockUser(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;
    await followerCache.updateBlockedUserInCache(req.currentUser!.userId, 'blocked', followerId, 'unblock');
    await followerCache.updateBlockedUserInCache(followerId, 'blockedBy', req.currentUser!.userId, 'unblock');

    blockQueue.addAuthUserJob('addBlockedUserToDB', {
      keyOne: req.currentUser!.userId,
      keyTwo: followerId,
      type: 'unblock'
    });
    res.status(STATUS_CODE.OK).json({ message: 'Unblocked user!' });
  }
}
