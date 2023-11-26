import { AuthModel } from '@auth/models/auth.schema';
import { IFollower, IFollowerData, IFollowerDocument } from '@follower/interfaces/follower.interface';
import { FollowerModel } from '@follower/models/follower.schema';
import { UserModel } from '@root/features/users/models/user.schema';
import { IBackgroundInfo, INotificationSettings, ISocialLinks, IUserDocument } from '@user/interfaces/user.interface';
import mongoose, { mongo } from 'mongoose';
import { followerService } from './follower.service';

class UserService {
  public async createUser(data: IUserDocument): Promise<void> {
    await UserModel.create(data);
  }
  public async getUserByAuthId(authId: string): Promise<IUserDocument> {
    const user: IUserDocument[] = await UserModel.aggregate([
      { $match: { authId: new mongoose.Types.ObjectId(authId) } },
      { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      { $project: this.aggregateProject() }
    ]);
    return user[0];
  }
  private aggregateProject() {
    return {
      _id: 1,
      username: '$authId.username',
      firstname: '$authId.firstname',
      lastname: '$authId.lastname',
      uId: '$authId.uId',
      email: '$authId.email',
      createdAt: '$authId.createdAt',
      postsCount: 1,
      work: 1,
      school: 1,
      quote: 1,
      location: 1,
      blocked: 1,
      blockedBy: 1,
      followersCount: 1,
      followingCount: 1,
      notifications: 1,
      social: 1,
      bgImageVersion: 1,
      bgImageId: 1,
      profilePicture: 1
    };
  }
  public async getUserById(id: string): Promise<IUserDocument> {
    const user: IUserDocument[] = await UserModel.aggregate([
      {$match: { _id: new mongoose.Types.ObjectId(id) }},
      {$lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' }},
      {$unwind: '$authId' },
      {$project: this.aggregateProject() }
    ]);
    return user[0];
  }
  public async updatePassword(uId: string, newHashedPassword: string): Promise<void> {
    await AuthModel.updateOne({ uId }, { $set: { password: newHashedPassword }});
  }
  public async updateNotiSettings(userId: string, value: INotificationSettings): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { notifications: value}} );
  }
  public async updateBackgroundInfomation(userId: string, value: IBackgroundInfo): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: {
      school: value.school,
      quote: value.quote,
      work: value.work,
      location: value.location
    }}).exec();
  }

  public async updateSocialLinks(userId: string, value: ISocialLinks): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: {
      social: value
    }}).exec();
  }

  public async recommendUsers(userId: string): Promise<IUserDocument[]> {
    const followersOfCurrentUser = await FollowerModel.find({ followeeId: userId});
    const followersId = followersOfCurrentUser.map((item) => item.followerId);

    const followeesOfFollowers = await FollowerModel.find({ followerId: { $in: followersId }});
    const recommendUserIds = followeesOfFollowers.map((item) => item.followeeId);

    const recommendedUsers = await UserModel.find({ _id: { $in: { recommendUserIds }}});

    return recommendedUsers;
  }
}

export const userService: UserService = new UserService();
