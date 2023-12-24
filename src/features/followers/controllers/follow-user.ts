import { IFollowerData } from '@follower/interfaces/follower.interface';
import { followerQueue } from '@service/queues/follower.queue';
import { FollowerCache } from '@service/redis/follower.cache';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import STATUS_CODE from 'http-status-codes';
import { userService } from '@service/db/user.service';

const followerCache: FollowerCache = new FollowerCache();
const userCache: UserCache = new UserCache();
export class Add {
  public async followers(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;

    //update follower and following count in user
    const followingCount: Promise<void> = followerCache.updateFollowersCountInCache(req.currentUser!.userId, 'followingCount', 1);
    const followersCount: Promise<void> = followerCache.updateFollowersCountInCache(followerId, 'followersCount', 1);
    await Promise.all([followingCount, followersCount]);

    const cachedFollowee: IUserDocument = (await userCache.getUserFromCache(req.currentUser!.userId)) as IUserDocument;
    const followee: IUserDocument = cachedFollowee ? cachedFollowee : await userService.getUserById(req.currentUser!.userId);
    const cachedFollower: IUserDocument = (await userCache.getUserFromCache(followerId)) as IUserDocument;
    const follower: IUserDocument = cachedFollower ? cachedFollower : await userService.getUserById(followerId);

    const followerObjectId: ObjectId = new ObjectId();
    const addFoloweeData: IFollowerData = Add.prototype.userData(followee);

    //send addFolloweeData to client with SOCKETIO

    const addFollowerToCache: Promise<void> = followerCache.saveFollowerToCache(`following:${req.currentUser!.userId}`, followerId);
    const addFolloweeToCache: Promise<void> = followerCache.saveFollowerToCache(`followers:${followerId}`, req.currentUser!.userId);
    await Promise.all([addFolloweeToCache, addFollowerToCache]);

    // send to queue
    followerQueue.addFollowerJob('addFollowerToDB', {
      keyOne: req.currentUser!.userId,
      keyTwo: followerId,
      username: req.currentUser!.username,
      followerDocumentId: followerObjectId
    });
    res.status(STATUS_CODE.OK).json({ message: 'Following user now!' });
  }

  private userData(user: IUserDocument): IFollowerData {
    return {
      _id: new mongoose.Types.ObjectId(user._id),
      username: user.username!,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      profilePicture: user.profilePicture,
      postCount: user.postsCount,
      uId: user.uId!,
      userProfile: user
    };
  }
}
