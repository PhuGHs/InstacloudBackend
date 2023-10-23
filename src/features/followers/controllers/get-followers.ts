import { IFollowerData } from '@follower/interfaces/follower.interface';
import { followerService } from '@service/db/follower.service';
import { FollowerCache } from '@service/redis/follower.cache';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import STATUS_CODE from 'http-status-codes';

const followerCache: FollowerCache = new FollowerCache();
export class Get {
  public async followers(req: Request, res: Response): Promise<void> {
    const userId = req.params.userId;
    const userObjectId: ObjectId = new mongoose.Types.ObjectId(userId);

    const cachedFollowerList: IFollowerData[] = await followerCache.getFollowerFromCache(`followers:${userId}`);
    const followers: IFollowerData[] = cachedFollowerList.length ? cachedFollowerList :
    await followerService.getFollowers(userObjectId);
    res.status(STATUS_CODE.OK).json({ message: 'followers list', followers});
  }

  public async following(req: Request, res: Response): Promise<void> {
    const userId = req.params.userId;
    const userObjectId: ObjectId = new mongoose.Types.ObjectId(userId);

    const cachedFollowerList: IFollowerData[] = await followerCache.getFollowerFromCache(`following:${userId}`);
    const followingList: IFollowerData[] = cachedFollowerList.length ? cachedFollowerList :
    await followerService.getFollowingList(userObjectId);
    res.status(STATUS_CODE.OK).json({ message: 'following list', followingList});
  }
}
