import { RedisCommandRawReply } from '@redis/client/dist/lib/commands';
import { config } from '@root/config';
import { ICommentDocument, ICommentNameList, ISaveCommentToCache } from '@root/features/comments/interfaces/comment.interface';
import { ServerError } from '@root/shared/globals/helpers/error-handler';
import { SupportiveMethods } from '@root/shared/globals/helpers/supportive-methods';
import { BaseCache } from '@service/redis/base.cache';
import Logger from 'bunyan';
import { find } from 'lodash';
import { PostCache } from './post.cache';

export type CommentMultiType = string | number | Buffer | RedisCommandRawReply[] | ICommentDocument | ICommentDocument[];
const log: Logger = config.createLogger('commentCache');
export class CommentCache extends BaseCache {
  constructor() {
    super('commentCache');
  }
  public async addCommentToCache(data: ISaveCommentToCache): Promise<void> {
    try {
      if(!this.client.isOpen) {
        this.client.connect();
      }
      const { commentId, commentData } = data;
      const {
        _id,
        username,
        firstname,
        lastname,
        postId,
        profilePicture,
        comment,
        createdAt,
        reactions,
        userTo
      } = commentData;

      const dataToSave: string[] = [
        '_id', `${_id}`,
        'username', `${username}`,
        'firstname', `${firstname}`,
        'lastname', `${lastname}`,
        'postId', `${postId}`,
        'profilePicture', `${profilePicture}`,
        'comment', `${comment}`,
        'createdAt', `${createdAt}`,
        'reactions', JSON.stringify(reactions),
        'userTo', `${userTo}`
      ];
      const pId: string[] = await this.client.HMGET(`posts:${postId}`, 'pId');
      await this.client.ZADD('comment', { score: parseInt(pId[0], 10), value: commentId });
      for (let i = 0; i < dataToSave.length; i += 2) {
        const field = dataToSave[i];
        const value = dataToSave[i + 1];
        await this.client.HSET(`comments:${commentId}`, field, value);
      }
      const commentCount: string[] = await this.client.HMGET(`posts:${postId}`, 'commentsCount');
      let count: number = Number(commentCount[0]);
      count += 1;
      await this.client.HSET(`posts:${postId}`, 'commentsCount', count);
    } catch(error) {
      log.error(error);
      throw new ServerError('Server Error. Try again!');
    }
  }

  public async getCommentsFromCache(key: string, postId: string): Promise<ICommentDocument[]> {
    try {
      if(!this.client.isOpen) {
        this.client.connect();
      }
      const comments: ICommentDocument[] = [];
      const pId: string[] = await this.client.HMGET(`posts:${postId}`, 'pId');
      const reply: string[] = await this.client.ZRANGEBYSCORE(key, Number(pId[0]), Number(pId[0]));
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for(const value of reply) {
        multi.HGETALL(`comments:${value}`);
      }
      const replies: CommentMultiType = await multi.exec();
      for(const comment of replies as unknown as ICommentDocument[]) {
        comment.reactions = SupportiveMethods.parseJson(`${comment.reactions}`);
        comment.createdAt = new Date(SupportiveMethods.parseJson(`${comment.createdAt}`));
        comments.push(comment);
      }
      return comments;
    } catch(error) {
      log.error(error);
      throw new ServerError('Server error. Try again');
    }
  }

  public async getCommentUsernamesFromCache(key: string, postId: string): Promise<ICommentNameList[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const list: Set<string> = new Set();
      const pId: string[] = await this.client.HMGET(`posts:${postId}`, 'pId');
      const reply: string[] = await this.client.ZRANGEBYSCORE(key, Number(pId[0]), Number(pId[0]));
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for(const value of reply) {
        multi.HGETALL(`comments:${value}`);
      }
      const replies: CommentMultiType = await multi.exec();
      for(const comment of replies as unknown as ICommentDocument[]) {
        list.add(comment.username);
      }

      const ICommentNameList: ICommentNameList = {
        count: replies.length,
        names: [...list]
      };

      return [ICommentNameList];
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getSingleCommentFromAPostFromCache(postId: string, commentId: string): Promise<ICommentDocument[]> {
    try {
      if(!this.client.isOpen) {
        this.client.connect();
      }
      const comments: ICommentDocument[] = [];
      const pId: string[] = await this.client.HMGET(`posts:${postId}`, 'pId');
      const reply: string[] = await this.client.ZRANGEBYSCORE('comment', pId[0], pId[0]);
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for(const value of reply) {
        multi.HGETALL(`comments:${value}`);
      }
      const replies: CommentMultiType = await multi.exec();
      for(const comment of replies as unknown as ICommentDocument[]) {
        comment.reactions = SupportiveMethods.parseJson(`${comment.reactions}`);
        comment.createdAt = new Date(SupportiveMethods.parseJson(`${comment.createdAt}`));
        comments.push(comment);
      }
      const result: ICommentDocument = find(comments, (commentItem: ICommentDocument) => {
        return commentItem._id === commentId;
      }) as ICommentDocument;

      return [result];
    } catch(error) {
      log.error(error);
      throw new ServerError('Server error. Try again');
    }
  }

  public async updateACommentInCache(commentId: string, updatedComment: ICommentDocument): Promise<ICommentDocument> {
    const { comment, profilePicture } = updatedComment;
    const dataToSave: string[] = [
      'profilePicture', `${profilePicture}`,
      'comment', `${comment}`
    ];
    try {
      if(!this.client.isOpen) {
        this.client.connect();
      }
      for (let i = 0; i < dataToSave.length; i += 2) {
        const field = dataToSave[i];
        const value = dataToSave[i + 1];
        await this.client.HSET(`comments:${commentId}`, field, value);
      }
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      multi.HGETALL(`comments:${commentId}`);

      const reply = await multi.exec() as unknown as ICommentDocument[];
      reply[0].reactions = SupportiveMethods.parseJson(`${reply[0].reactions}`);
      reply[0].createdAt = SupportiveMethods.parseJson(`${reply[0].createdAt}`);

      return reply[0];
    } catch(error) {
      log.error(error);
      throw new ServerError('Server error. Try again');
    }
  }

  public async deleteAComment(commentId: string, postId: string): Promise<void> {
    try {
      if(!this.client.isOpen) {
        this.client.connect();
      }
      const commentsCount: string | undefined = await this.client.HGET(`posts:${postId}`, 'commentsCount');
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      multi.ZREM('comment', `${commentId}`);
      multi.DEL(`comments:${commentId}`);
      //remove reactions as well
      const number: number = parseInt(commentsCount!, 10) - 1;
      multi.HSET(`posts:${postId}`, 'commentsCount', number);

      await multi.exec();
    } catch(error) {
      log.error(error);
      throw new ServerError('Server error. Try again');
    }
  }
}
