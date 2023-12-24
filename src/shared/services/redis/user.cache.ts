import { config } from '@root/config';
import Logger from 'bunyan';
import { BaseCache } from './base.cache';
import { INotificationSettings, ISocialLinks, IUserDocument } from '@user/interfaces/user.interface';
import { ServerError } from '@global/helpers/error-handler';
import { SupportiveMethods } from '@root/shared/globals/helpers/supportive-methods';
import { string } from 'joi';

type UserItem = string | ISocialLinks | INotificationSettings;

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
      fullname,
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
      social
    } = user;

    const firstList: string[] = [
      '_id',
      `${_id}`,
      'uId',
      `${uId}`,
      'username',
      `${username}`,
      'fullname',
      `${fullname}`,
      'email',
      `${email}`,
      'createdAt',
      `${new Date()}`,
      'postsCount',
      `${postsCount}`
    ];

    const secondList: string[] = [
      'blocked',
      `${JSON.stringify(blocked)}`,
      'blockedBy',
      `${JSON.stringify(blockedBy)}`,
      'profilePicture',
      `${profilePicture}`,
      'followersCount',
      `${followersCount}`,
      'followingCount',
      `${followingCount}`,
      'notifications',
      `${JSON.stringify(notifications)}`,
      'social',
      `${JSON.stringify(social)}`
    ];

    const thirdList: string[] = ['work', `${work}`, 'location', `${location}`, 'school', `${school}`, 'quote', `${quote}`];

    const saveData: string[] = [...firstList, ...secondList, ...thirdList];
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      await this.client.zAdd('user', { score: parseInt(userUId, 10), value: `${key}` }); //score is used to retrieve each item from the set
      for (let i = 0; i < saveData.length; i += 2) {
        const field = saveData[i];
        const value = saveData[i + 1];
        await this.client.hSet(`users:${key}`, field, value);
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again later');
    }
  }

  public async getUserFromCache(userId: string): Promise<IUserDocument | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response: IUserDocument = (await this.client.hGetAll(`users:${userId}`)) as unknown as IUserDocument;
      if (Object.keys(response).length < 17) {
        return null;
      } else {
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
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again later');
    }
  }

  public async updateSingleItemInCache(userId: string, prop: string, value: UserItem): Promise<IUserDocument> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const user: IUserDocument = (await this.getUserFromCache(userId)) as IUserDocument;
      if (user !== null) {
        console.log('not null');
        if (typeof value === 'string') {
          await this.client.HSET(`users:${userId}`, prop, value);
        } else {
          await this.client.HSET(`users:${userId}`, prop, JSON.stringify(value));
        }
      }
      return user;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again later');
    }
  }

  public async getTotalNumberOfUsers(): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const count: number = await this.client.ZCARD('user');
      return count;
    } catch (error) {
      log.error(error);
      throw new Error('Server error. Try again later');
    }
  }
}
