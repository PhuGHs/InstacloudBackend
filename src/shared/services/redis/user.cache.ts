import { config } from '@root/config';
import Logger from 'bunyan';
import { BaseCache } from './base.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { ServerError } from '@global/helpers/error-handler';
import { SupportiveMethods } from '@root/shared/globals/helpers/supportive-methods';

const log: Logger = config.createLogger('userCache');
export class UserCache extends BaseCache {
  constructor() {
    super('userCache');
  }

  public async saveUserToCache(key: string, userUId: string, user: IUserDocument): Promise<void> {
    const {
      _id,
      uId,
      username,
      firstname,
      lastname,
      email,
      blocked,
      blockedBy,
      postsCount,
      profilePicture,
      followersCount,
      followingCount,
      notifications,
      work,
      location,
      school,
      quote,
      bgImageId,
      bgImageVersion,
      social
    } = user;

    const firstList : string[] = [
      '_id', `${_id}`,
      'uId', `${uId}`,
      'username', `${username}`,
      'firstname', `${firstname}`,
      'lastname', `${lastname}`,
      'email', `${email}`,
      'createdAt', `${new Date()}`,
      'postsCount', `${postsCount}`,
    ];

    const secondList : string[] = [
        'blocked', `${JSON.stringify(blocked)}`,
        'blockedBy', `${JSON.stringify(blockedBy)}`,
        'profilePicture', `${profilePicture}`,
        'followersCount', `${followersCount}`,
        'followingCount', `${followingCount}`,
        'notifications', `${JSON.stringify(notifications)}`,
        'social', `${JSON.stringify(social)}`,
    ];

    const thirdList : string[] = [
      'work', `${work}`,
      'location', `${location}`,
      'school', `${school}`,
      'quote', `${quote}`,
      'bgImageVersion', `${bgImageVersion}`,
      'bgImageId', `${bgImageId}`,
    ];

    const saveData: string[] = [...firstList, ...secondList, ...thirdList];
    try {
      if(!this.client.isOpen) {
        await this.client.connect();
      }

      await this.client.zAdd('user', {score: parseInt(userUId, 10), value: `${key}`}); //score is used to retrieve each item from the set
      for (let i = 0; i < saveData.length; i += 2) {
        const field = saveData[i];
        const value = saveData[i + 1];
        await this.client.hSet(`users:${key}`, field, value);
      }
    } catch(error) {
      log.error(error);
      throw new ServerError('Server error. Try again later');
    }
  }

  public async getUserFromCache(userId: string) : Promise<IUserDocument | null> {
    try {
      if(!this.client.isOpen) {
        await this.client.connect();
      }

      const response : IUserDocument = await this.client.hGetAll(`users:${userId}`) as unknown as IUserDocument;
      response.createdAt = new Date(SupportiveMethods.parseJson(`${response.createdAt}`));
      response.social = SupportiveMethods.parseJson(`${response.social}`);
      response.postsCount = SupportiveMethods.parseJson(`${response.postsCount}`);
      response.blocked = SupportiveMethods.parseJson(`${response.blocked}`);
      response.blockedBy = SupportiveMethods.parseJson(`${response.blockedBy}`);
      response.work = SupportiveMethods.parseJson(`${response.work}`);
      response.school = SupportiveMethods.parseJson(`${response.school}`);
      response.location = SupportiveMethods.parseJson(`${response.location}`);
      response.quote = SupportiveMethods.parseJson(`${response.quote}`);
      response.notifications = SupportiveMethods.parseJson(`${response.notifications}`);
      response.followersCount = SupportiveMethods.parseJson(`${response.followersCount}`);
      response.followingCount = SupportiveMethods.parseJson(`${response.followingCount}`);


      return response;
    } catch(error) {
      log.error(error);
      throw new ServerError('Server error. Try again later');
    }
  }
}
