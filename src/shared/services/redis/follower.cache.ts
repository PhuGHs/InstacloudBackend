import Logger from 'bunyan';
import { BaseCache } from './base.cache';
import { config } from '@root/config';
import { ServerError } from '@global/helpers/error-handler';
import { IFollower, IFollowerData, IFollowerDocument } from '@follower/interfaces/follower.interface';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserCache } from './user.cache';
import mongoose from 'mongoose';
import { SupportiveMethods } from '@global/helpers/supportive-methods';
import { remove } from 'lodash';

const log: Logger = config.createLogger('followerCache');
const userCache: UserCache = new UserCache();
export class FollowerCache extends BaseCache {
  constructor() {
    super('followerCache');
  }
  public async saveFollowerToCache(key: string, value: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      await this.client.LPUSH(key, value);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again');
    }
  }

  public async removeFollowerFromCache(key: string, value: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      await this.client.LREM(key, 1, value);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again');
    }
  }

  public async updateFollowersCountInCache(userId: string, prop: string, value: number): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.HINCRBY(`users:${userId}`, prop, value);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again');
    }
  }

  public async getFollowerFromCache(key: string): Promise<IFollowerData[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const list: IFollowerData[] = [];
      const response: string[] = await this.client.LRANGE(key, 0, -1);
      for (const item of response) {
        const user: IUserDocument = (await userCache.getUserFromCache(item)) as IUserDocument;
        const data: IFollowerData = {
          _id: new mongoose.Types.ObjectId(user._id),
          uId: user.uId!,
          username: user.username!,
          postCount: user.postsCount,
          followersCount: user.followersCount,
          followingCount: user.followingCount,
          profilePicture: user.profilePicture,
          userProfile: user
        };
        list.push(data);
      }
      return list;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again');
    }
  }

  public async updateBlockedUserInCache(key: string, prop: string, value: string, type: 'block' | 'unblock'): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response: string = (await this.client.HGET(`users:${key}`, prop)) as string;
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      let blocked: string[] = SupportiveMethods.parseJson(response) as string[];

      if (type === 'block') {
        blocked = [...blocked, value];
      } else {
        remove(blocked, (id: string) => id === value);
        blocked = [...blocked];
      }

      multi.HSET(`users:${key}`, prop, JSON.stringify(blocked));
      await multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again');
    }
  }
}
