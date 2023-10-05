import { config } from '@root/config';
import Logger from 'bunyan';
import { BaseCache } from './base.cache';
import { IPostDocument, ISavePostToCache } from '@post/interfaces/post.interface';
import { ServerError } from '@root/shared/globals/helpers/error-handler';
import { SupportiveMethods } from '@root/shared/globals/helpers/supportive-methods';
import { IReactions } from '@root/features/reactions/interfaces/reaction.interface';


const log: Logger = config.createLogger('postCache');
export class PostCache extends BaseCache {
  constructor() {
    super('postCache');
  }

  public async savePostToCache(data: ISavePostToCache): Promise<void> {
    const { key, currentUserId, uId, createdPost } = data;
    const {
      _id,
      userId,
      username,
      email,
      profilePicture,
      post,
      privacy,
      feelings,
      gifUrl,
      commentsCount,
      imgId,
      imgVersion,
      reactions,
      createdAt
    } = createdPost;

    const dataToSave: string[] = [
      '_id', `${_id}`,
      'userId', `${userId}`,
      'username', `${username}`,
      'email', `${email}`,
      'profilePicture', `${profilePicture}`,
      'post', `${post}`,
      'feelings', `${feelings}`,
      'privacy', `${privacy}`,
      'gifUrl', `${gifUrl}`,
      'commentsCount', `${commentsCount}`,
      'imgVersion', `${imgVersion}`,
      'imgId', `${imgId}`,
      'createdAt', `${createdAt}`,
      'reactions', JSON.stringify(reactions),
    ];

    try {
      if(!this.client.isOpen) {
        this.client.connect();
      }
      const postCount: string[] = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');
      await this.client.zAdd('post', { score: parseInt(uId, 10), value:`${key}`});
      for (let i = 0; i < dataToSave.length; i += 2) {
        const field = dataToSave[i];
        const value = dataToSave[i + 1];
        await this.client.HSET(`posts:${key}`, field, value);
      }

      const count: number = parseInt(postCount[0], 10) + 1;
      await this.client.HSET(`users:${currentUserId}`, 'postsCount', count);
    } catch(error) {
      log.error(error);
      throw new ServerError('Server error. Try again');
    }
  }

  public async updatePostInCache(key: string, updatedPost: IPostDocument): Promise<IPostDocument> {
    const {post, feelings, privacy, gifUrl, imgId, imgVersion, profilePicture } = updatedPost;

    const dataToSave: string[] = [
      'profilePicture', `${profilePicture}`,
      'post', `${post}`,
      'feelings', `${feelings}`,
      'privacy', `${privacy}`,
      'gifUrl', `${gifUrl}`,
      'imgVersion', `${imgVersion}`,
      'imgId', `${imgId}`,
    ];

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      for (let i = 0; i < dataToSave.length; i += 2) {
        const field = dataToSave[i];
        const value = dataToSave[i + 1];
        await this.client.HSET(`posts:${key}`, field, value);
      }

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      multi.HGETALL(`posts:${key}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reply = await multi.exec() as any as IPostDocument[];
      reply[0].commentsCount = SupportiveMethods.parseJson(`${reply[0].commentsCount}`) as number;
      reply[0].reactions = SupportiveMethods.parseJson(`${reply[0].reactions}`) as IReactions;
      reply[0].createdAt = new Date(SupportiveMethods.parseJson(`${reply[0].createdAt}`)) as Date;

      return reply[0];
    } catch(error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async deleteAPostInCache(postId: string, userId: string): Promise<void> {
    try {
      if(!this.client.isOpen) {
        this.client.connect();
      }
      const postCount: string | undefined = await this.client.HGET(`users:${userId}`, 'postsCount');
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      multi.ZREM('post', `${postId}`);
      multi.DEL(`posts:${postId}`);
      //remove comment and reactions as well
      const count: number = parseInt(postCount!, 10) - 1;
      multi.HSET(`users:${userId}`, ['postsCount', count]);

      await multi.exec();
    } catch(error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  // public async getAllPostsOfCurrentUser(userId: string): Promise<IPostDocument[]> {
  //   try {
  //     if(!this.client.isOpen) {
  //       this.client.connect();
  //     }
  //     let posts: IPostDocument[] = [];

  //   } catch(error) {
  //     log.error(error);
  //     throw new ServerError('Server error. Try again!');
  //   }
  // }
}

