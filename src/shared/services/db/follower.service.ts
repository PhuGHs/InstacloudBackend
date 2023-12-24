import { IFollowerData, IFollowerDocument } from '@follower/interfaces/follower.interface';
import { FollowerModel } from '@follower/models/follower.schema';
import { INotificationDocument } from '@notification/interfaces/notification.interface';
import { NotificationModel } from '@notification/models/notification.schema';
import { IQueryComplete, IQueryDeleted } from '@post/interfaces/post.interface';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.schema';
import { ObjectId } from 'mongodb';
import mongoose, { Query } from 'mongoose';
import { userService } from './user.service';
import { socketIONotificationObject } from '@socket/notification.socket';

const userCache: UserCache = new UserCache();
class FollowerService {
  public async addFollowerToDB(userId: string, followeeId: string, username: string, followerDocumentId: ObjectId): Promise<void> {
    const followerObjectId: ObjectId = new mongoose.Types.ObjectId(userId);
    const followeeObjectId: ObjectId = new mongoose.Types.ObjectId(followeeId);

    const following = await FollowerModel.create({
      _id: followerDocumentId,
      followeeId: followeeObjectId,
      followerId: followerObjectId
    });

    const users: Promise<mongoose.mongo.BulkWriteResult> = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: { $inc: { followingCount: 1 } }
        }
      },
      {
        updateOne: {
          filter: { _id: followeeId },
          update: { $inc: { followingCount: 1 } }
        }
      }
    ]);

    const response: [mongoose.mongo.BulkWriteResult, IUserDocument | null, IUserDocument | null] = await Promise.all([
      users,
      userService.getUserById(followeeId),
      userService.getUserById(userId)
    ]);

    //send notification
    if (response[1]?.notifications.follows && userId !== followeeId) {
      const notificationModel: INotificationDocument = new NotificationModel();
      const notification = await notificationModel.insertNotification({
        userFrom: userId,
        userFromProfilePicture: response[2]!.profilePicture,
        userTo: followeeId,
        message: `${username} is following you now!`,
        notificationType: 'follows',
        entityId: new mongoose.Types.ObjectId(userId),
        createdItemId: new mongoose.Types.ObjectId(following._id),
        comment: '',
        reaction: '',
        post: '',
        imgId: '',
        imgVersion: '',
        gifUrl: '',
        createdAt: new Date()
      });
      socketIONotificationObject.emit('insert notification', notification, { followeeId });
    }

    //send to email queue
  }

  public async removeFollowerFromDB(followeeId: string, followerId: string): Promise<void> {
    const followeeObId: ObjectId = new mongoose.Types.ObjectId(followeeId);
    const followerObId: ObjectId = new mongoose.Types.ObjectId(followerId);

    await FollowerModel.deleteOne({
      followerId: followerObId,
      followeeId: followeeObId
    });

    await UserModel.updateOne({ _id: followeeId }, { $inc: { followersCount: -1 } });
    await UserModel.updateOne({ _id: followerId }, { $inc: { followingCount: -1 } });
  }

  public async getFollowers(userObjectId: ObjectId): Promise<IFollowerData[]> {
    const followee = await FollowerModel.aggregate([
      { $match: { followeeId: userObjectId } },
      { $lookup: { from: 'User', localField: 'followerId', foreignField: '_id', as: 'followerId' } },
      { $unwind: '$follower' },
      { $lookup: { from: 'Auth', localField: 'follower.authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$auth' },
      {
        $addFields: {
          _id: '$follower._id',
          username: '$auth.username',
          uId: '$auth.username',
          userProfle: '$follower',
          postCount: '$follower.postsCount',
          followersCount: '$follower.followersCount',
          followingCount: '$follower.followingCount',
          profilePicture: '$follower.profilePicture'
        }
      },
      {
        $project: {
          authId: 0,
          followerId: 0,
          createdAt: 0,
          followeeId: 0,
          __v: 0
        }
      }
    ]);
    return followee;
  }

  public async getFollowingList(userObjectId: ObjectId): Promise<IFollowerData[]> {
    const followingList = await FollowerModel.aggregate([
      { $match: { followerId: userObjectId } },
      { $lookup: { from: 'User', localField: 'followeeId', foreignField: '_id', as: 'followeeId' } },
      { $unwind: '$followee' },
      { $lookup: { from: 'Auth', localField: 'followee.authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$auth' },
      {
        $addFields: {
          _id: '$followee._id',
          username: '$auth.username',
          uId: '$auth.username',
          userProfle: '$followee',
          postCount: '$followee.postsCount',
          followersCount: '$followee.followersCount',
          followingCount: '$followee.followingCount',
          profilePicture: '$followee.profilePicture'
        }
      },
      {
        $project: {
          authId: 0,
          followerId: 0,
          createdAt: 0,
          followeeId: 0,
          __v: 0
        }
      }
    ]);
    return followingList;
  }
}

export const followerService: FollowerService = new FollowerService();
