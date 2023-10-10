import { RedisCommandRawReply } from '@redis/client/dist/lib/commands';
import { config } from '@root/config';
import { ICommentDocument, ICommentNameList } from '@root/features/comments/interfaces/comment.interface';
import { ServerError } from '@root/shared/globals/helpers/error-handler';
import { SupportiveMethods } from '@root/shared/globals/helpers/supportive-methods';
import { BaseCache } from '@service/redis/base.cache';
import Logger from 'bunyan';
import { find } from 'lodash';

export type CommentMultiType = string | ICommentDocument | ICommentDocument[] | RedisCommandRawReply[] | number;
const log: Logger = config.createLogger('commentCache');
export class CommentCache extends BaseCache {
  constructor() {
    super('commentCache');
  }
  public async addCommentToCache(postId: string, value: string): Promise<void> {
    try {
      if(!this.client.isOpen) {
        this.client.connect();
      }

      await this.client.LPUSH(`comments:${postId}`, value);
      const commentCount: string[] = await this.client.HMGET(`posts:${postId}`, 'commentsCount');
      let count: number = SupportiveMethods.parseJson(commentCount[0]) as number;
      count += 1;
      await this.client.HSET(`posts:${postId}`, 'commentsCount', count);
    } catch(error) {
      log.error(error);
      throw new ServerError('Server Error. Try again!');
    }
  }

  public async getCommentsFromCache(postId: string): Promise<ICommentDocument[]> {
    try {
      if(!this.client.isOpen) {
        this.client.connect();
      }
      const comments: ICommentDocument[] = [];
      const replies: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);
      for(const reply of replies) {
        comments.push(SupportiveMethods.parseJson(reply));
      }
      return comments;
    } catch(error) {
      log.error(error);
      throw new ServerError('Server error. Try again');
    }
  }

  public async getCommentUsernamesFromCache(postId: string): Promise<ICommentNameList[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const replies: number = await this.client.LLEN(`comments:${postId}`);
      const comments: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);
      const list: string[] = [];
      for(const item of comments) {
        const comment = SupportiveMethods.parseJson(item) as ICommentDocument;
        list.push(comment.username);
      }

      const ICommentNameList: ICommentNameList = {
        count: replies,
        names: list
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
      const list: ICommentDocument[] = [];
      const replies: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);
      for(const reply of replies) {
        list.push(SupportiveMethods.parseJson(reply));
      }
      const result: ICommentDocument = find(list, (listItem: ICommentDocument) => {
        return listItem._id === commentId;
      }) as ICommentDocument;

      return [result];
    } catch(error) {
      log.error(error);
      throw new ServerError('Server error. Try again');
    }
  }
}
