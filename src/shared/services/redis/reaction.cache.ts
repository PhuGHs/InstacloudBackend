import { config } from '@root/config';
import { IReactionDocument, IReactions } from '@root/features/reactions/interfaces/reaction.interface';
import { ServerError } from '@root/shared/globals/helpers/error-handler';
import { BaseCache } from '@service/redis/base.cache';
import Logger from 'bunyan';
import { CommentCache } from './comment.cache';
import { ICommentDocument } from '@comment/interfaces/comment.interface';

const log: Logger = config.createLogger('reactionCache');
const commentCache: CommentCache = new CommentCache();
export class ReactionCache extends BaseCache {
  constructor() {
    super('reactionCache');
  }
  public async addPostReactionToCache(postId: string, reaction: IReactionDocument, reactions: IReactions): Promise<void> {
    try {
      if(!this.client.isOpen) {
        this.client.connect();
      }
      await this.client.LPUSH(`reactions:${postId}`, JSON.stringify(reaction));
      await this.client.HSET(`posts:${postId}`, 'reactions', JSON.stringify(reactions));
    } catch(error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async addCommentReactionToCache(postId: string, commentId: string, reaction: IReactionDocument, reactions: IReactions): Promise<void> {
    try {
      if(!this.client.isOpen) {
        this.client.connect();
      }
      await this.client.LPUSH(`reactions:${commentId}`, JSON.stringify(reaction));
      const comment: ICommentDocument[] = await commentCache.getSingleCommentFromAPostFromCache(postId, commentId) as ICommentDocument[];
      comment[0].reactions = reactions;
      // await this.client.LREM(`comments:${postId}`, 1, )
      await this.client.HSET(`comments:${postId}`, 'reactions', JSON.stringify(reactions));
    } catch(error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}
