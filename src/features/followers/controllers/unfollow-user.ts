import { followerQueue } from '@service/queues/follower.queue';
import { FollowerCache } from '@service/redis/follower.cache';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';

const followerCache: FollowerCache = new FollowerCache();
export class Remove {
  public async follower(req: Request, res: Response): Promise<void> {
    const { followeeId, followerId } = req.params;

    const followersCount: Promise<void> = followerCache.updateFollowersCountInCache(followeeId, 'followersCount', -1);
    const followeeCount: Promise<void> = followerCache.updateFollowersCountInCache(followerId, 'followingCount', -1);
    await Promise.all([followersCount, followeeCount]);

    const removeFollowersFromCache: Promise<void> = followerCache.removeFollowerFromCache(
      `following:${req.currentUser!.userId}`,
      followeeId
    );
    const removeFoloweesFromCache: Promise<void> = followerCache.removeFollowerFromCache(`followers:${followeeId}`, followerId);
    await Promise.all([removeFollowersFromCache, removeFoloweesFromCache]);

    followerQueue.addFollowerJob('removeFollowerFromDB', { keyOne: followeeId, keyTwo: followerId });
    res.status(STATUS_CODE.OK).json({ message: 'unfollow user now!' });
  }
}
