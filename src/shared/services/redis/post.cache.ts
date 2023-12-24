import { config } from '@root/config';
import Logger from 'bunyan';
import { BaseCache } from './base.cache';
import { IPostDocument, ISavePostToCache } from '@post/interfaces/post.interface';
import { ServerError } from '@root/shared/globals/helpers/error-handler';
import { SupportiveMethods } from '@root/shared/globals/helpers/supportive-methods';
import { IReactions } from '@root/features/reactions/interfaces/reaction.interface';
import { RedisCommandRawReply } from '@redis/client/dist/lib/commands';
import { Request } from 'express';
import { IUserDocument } from '@user/interfaces/user.interface';

const log: Logger = config.createLogger('postCache');
export type PostCacheMultiType = string | number | Buffer | RedisCommandRawReply[] | IPostDocument | IPostDocument[];
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
      videoId,
      videoVersion,
      reactions,
      createdAt,
      pId
    } = createdPost;

    const dataToSave: string[] = [
      '_id',
      `${_id}`,
      'userId',
      `${userId}`,
      'username',
      `${username}`,
      'email',
      `${email}`,
      'profilePicture',
      `${profilePicture}`,
      'post',
      `${post}`,
      'pId',
      `${pId}`,
      'feelings',
      `${feelings}`,
      'privacy',
      `${privacy}`,
      'gifUrl',
      `${gifUrl}`,
      'commentsCount',
      `${commentsCount}`,
      'imgVersion',
      `${imgVersion}`,
      'imgId',
      `${imgId}`,
      'videoId',
      `${videoId}`,
      'videoVersion',
      `${videoVersion}`,
      'createdAt',
      `${createdAt}`,
      'reactions',
      JSON.stringify(reactions)
    ];

    try {
      if (!this.client.isOpen) {
        this.client.connect();
      }
      const postCount: string[] = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');
      await this.client.zAdd('post', { score: parseInt(uId, 10), value: `${key}` });
      for (let i = 0; i < dataToSave.length; i += 2) {
        const field = dataToSave[i];
        const value = dataToSave[i + 1];
        await this.client.HSET(`posts:${key}`, field, value);
      }

      const count: number = Number(postCount[0]) + 1;
      await this.client.HSET(`users:${currentUserId}`, 'postsCount', count);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again');
    }
  }

  public async updatePostInCache(key: string, updatedPost: IPostDocument): Promise<IPostDocument | null> {
    const { post, feelings, privacy, gifUrl, imgId, imgVersion, profilePicture, videoId, videoVersion } = updatedPost;

    const dataToSave: string[] = [
      'profilePicture',
      `${profilePicture}`,
      'post',
      `${post}`,
      'feelings',
      `${feelings ? feelings : ''}`,
      'privacy',
      `${privacy ? privacy : ''}`,
      'gifUrl',
      `${gifUrl ? gifUrl : ''}`,
      'imgVersion',
      `${imgVersion ? imgVersion : ''}`,
      'imgId',
      `${imgId ? imgId : ''}`,
      'videoVersion',
      `${videoVersion ? videoVersion : ''}`,
      'videoId',
      `${videoId ? videoId : ''}`
    ];

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const post: IPostDocument[] = await this.getAPostFromCache(key);
      if (post.length === 0) {
        return null;
      }

      for (let i = 0; i < dataToSave.length; i += 2) {
        const field = dataToSave[i];
        const value = dataToSave[i + 1];
        await this.client.HSET(`posts:${key}`, field, value);
      }

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      multi.HGETALL(`posts:${key}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reply = (await multi.exec()) as any as IPostDocument[];
      reply[0].commentsCount = SupportiveMethods.parseJson(`${reply[0].commentsCount}`) as number;
      reply[0].reactions = SupportiveMethods.parseJson(`${reply[0].reactions}`) as IReactions;
      reply[0].createdAt = new Date(SupportiveMethods.parseJson(`${reply[0].createdAt}`)) as Date;

      return reply[0];
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async deleteAPostInCache(postId: string, userId: string, pId: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        this.client.connect();
      }
      const postCount: string | undefined = await this.client.HGET(`users:${userId}`, 'postsCount');
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      multi.ZREM('post', `${postId}`);
      multi.DEL(`posts:${postId}`);
      multi.DEL(`reactions:${postId}`);
      multi.ZREMRANGEBYSCORE('comment', pId, pId);
      // const commentId = this.client.ZRANGEBYSCORE('comment')
      const count: number = parseInt(postCount!, 10) - 1;
      multi.HSET(`users:${userId}`, ['postsCount', count]);

      await multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getAPostFromCache(postId: string): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        this.client.connect();
      }
      const post: string = (await this.client.HGET(`posts:${postId}`, 'pId')) as string;
      const posts: IPostDocument[] = [];
      if (post) {
        const multi: ReturnType<typeof this.client.multi> = this.client.multi();
        multi.HGETALL(`posts:${postId}`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const posts: IPostDocument[] = [];
        const reply = (await multi.exec()) as any as IPostDocument[];
        if (reply.length > 0) {
          reply[0].commentsCount = SupportiveMethods.parseJson(`${reply[0].commentsCount}`) as number;
          reply[0].reactions = SupportiveMethods.parseJson(`${reply[0].reactions}`) as IReactions;
          reply[0].createdAt = new Date(SupportiveMethods.parseJson(`${reply[0].createdAt}`)) as Date;
          posts.push(reply[0] as IPostDocument);
        }
        return posts;
      } else {
        return posts;
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getPostsFromCacheOfAUser(key: string, uId: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        this.client.connect();
      }
      const posts: IPostDocument[] = [];
      const reply: string[] = await this.client.ZRANGEBYSCORE(key, uId, uId);
      reply.reverse();
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }

      const replies: PostCacheMultiType = (await multi.exec()) as PostCacheMultiType;
      for (const post of replies as IPostDocument[]) {
        post.commentsCount = SupportiveMethods.parseJson(`${post.commentsCount}`);
        post.reactions = SupportiveMethods.parseJson(`${post.reactions}`);
        post.createdAt = new Date(SupportiveMethods.parseJson(`${post.createdAt}`));
        posts.push(post);
      }
      return posts;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again!');
    }
  }

  public async getPostsWithImagesOfAUserFromCache(key: string, uId: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const reply: string[] = await this.client.sendCommand(['zrevrange', key, `${uId}`, `${uId}`]);

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }

      const replies: PostCacheMultiType = (await multi.exec()) as PostCacheMultiType;
      const postReplies: IPostDocument[] = [];
      for (const post of replies as IPostDocument[]) {
        if (post.imgId && post.imgVersion) {
          post.commentsCount = SupportiveMethods.parseJson(`${post.commentsCount}`) as number;
          post.reactions = SupportiveMethods.parseJson(`${post.reactions}`) as IReactions;
          post.createdAt = new Date(SupportiveMethods.parseJson(`${post.createdAt}`));
          postReplies.push(post);
        }
      }
      return postReplies;
    } catch (error) {
      log.error(error);
      throw new ServerError('|getPostsWithImagesOfAUserFromCache| Server error. Try again');
    }
  }

  public async getPostsFromCache(key: string, start: number, end: number, user: IUserDocument): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        this.client.connect();
      }
      const posts: IPostDocument[] = [];
      const reply: string[] = await this.client.sendCommand(['zrevrange', key, `${start}`, `${end}`]);
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }

      const replies: PostCacheMultiType = (await multi.exec()) as PostCacheMultiType;
      for (const post of replies as IPostDocument[]) {
        if (!user.blocked.toString().includes(post.userId) && !user.blockedBy.toString().includes(post.userId)) {
          post.commentsCount = SupportiveMethods.parseJson(`${post.commentsCount}`);
          post.reactions = SupportiveMethods.parseJson(`${post.reactions}`);
          post.createdAt = new Date(SupportiveMethods.parseJson(`${post.createdAt}`));
          posts.push(post);
        }
      }
      return posts;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again!');
    }
  }

  public async getTotalPostsFromCache(): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const count: number = await this.client.ZCARD('post');
      return count;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again');
    }
  }

  public async getPostsWithImagesFromCache(key: string, start: number, end: number, user: IUserDocument): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const reply: string[] = await this.client.sendCommand(['zrevrange', key, `${start}`, `${end}`]);

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }

      const replies: PostCacheMultiType = (await multi.exec()) as PostCacheMultiType;
      const postReplies: IPostDocument[] = [];
      for (const post of replies as IPostDocument[]) {
        if (!user.blocked.toString().includes(post.userId) && !user.blockedBy.toString().includes(post.userId)) {
          if (post.imgId && post.imgVersion) {
            post.commentsCount = SupportiveMethods.parseJson(`${post.commentsCount}`) as number;
            post.reactions = SupportiveMethods.parseJson(`${post.reactions}`) as IReactions;
            post.createdAt = new Date(SupportiveMethods.parseJson(`${post.createdAt}`));
            postReplies.push(post);
          }
        }
      }
      return postReplies;
    } catch (error) {
      log.error(error);
      throw new ServerError('|getPostsWithImagesFromCache| Server error. Try again');
    }
  }

  public async getTotalPostsWithImagesFromCache(): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const count: number = await this.client.ZCARD('post');
      return count;
    } catch (error) {
      log.error(error);
      throw new ServerError('|getTotalPostsWithImagesFromCache| Server error. Try again');
    }
  }

  public async getPostsWithVideoFromCache(key: string, start: number, end: number, user: IUserDocument): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const reply: string[] = await this.client.sendCommand(['zrevrange', key, `${start}`, `${end}`]);

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }

      const replies: PostCacheMultiType = (await multi.exec()) as PostCacheMultiType;
      const postReplies: IPostDocument[] = [];
      for (const post of replies as IPostDocument[]) {
        if (!user.blocked.toString().includes(post.userId) && !user.blockedBy.toString().includes(post.userId)) {
          if (post.videoId && post.videoVersion) {
            post.commentsCount = SupportiveMethods.parseJson(`${post.commentsCount}`) as number;
            post.reactions = SupportiveMethods.parseJson(`${post.reactions}`) as IReactions;
            post.createdAt = new Date(SupportiveMethods.parseJson(`${post.createdAt}`));
            postReplies.push(post);
          }
        }
      }
      return postReplies;
    } catch (error) {
      log.error(error);
      throw new ServerError('|getPostsWithImagesFromCache| Server error. Try again');
    }
  }
}
