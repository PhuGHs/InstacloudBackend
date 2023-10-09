import { config } from '@root/config';
import { ServerError } from '@root/shared/globals/helpers/error-handler';
import { SupportiveMethods } from '@root/shared/globals/helpers/supportive-methods';
import { BaseCache } from '@service/redis/base.cache';
import Logger from 'bunyan';

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
}
