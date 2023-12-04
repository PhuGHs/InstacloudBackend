import { config } from '@root/config';
import { IReactionDocument, IReactions } from '@root/features/reactions/interfaces/reaction.interface';
import { ServerError } from '@root/shared/globals/helpers/error-handler';
import { BaseCache } from '@service/redis/base.cache';
import Logger from 'bunyan';
import { SupportiveMethods } from '@global/helpers/supportive-methods';
import { find } from 'lodash';

const log: Logger = config.createLogger('reactionCache');
export class ReactionCache extends BaseCache {
  constructor() {
    super('reactionCache');
  }
  public async addPostReactionToCache(postId: string, reaction: IReactionDocument, reactions: IReactions): Promise<void> {
    try {
      if (!this.client.isOpen) {
        this.client.connect();
      }
      await this.client.LPUSH(`reactions:${postId}`, JSON.stringify(reaction));
      await this.client.HSET(`posts:${postId}`, 'reactions', JSON.stringify(reactions));
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async addCommentReactionToCache(commentId: string, reaction: IReactionDocument, reactions: IReactions): Promise<void> {
    try {
      if (!this.client.isOpen) {
        this.client.connect();
      }
      await this.client.LPUSH(`reactions:${commentId}`, JSON.stringify(reaction));
      await this.client.HSET(`comments:${commentId}`, 'reactions', JSON.stringify(reactions));
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async removeReactionFromCache(key: string, username: string, postReactions: IReactions): Promise<void> {
    try {
      if (!this.client.isOpen) {
        this.client.connect();
      }
      const response: string[] = await this.client.LRANGE(`reactions:${key}`, 0, -1);
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      const userPreviousReaction: IReactionDocument = this.getPreviousPostReaction(response, username, key) as IReactionDocument;
      multi.LREM(`reactions:${key}`, 1, JSON.stringify(userPreviousReaction));
      await multi.exec();
      await this.client.HSET(`posts:${key}`, 'reactions', JSON.stringify(postReactions));
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async removeCommentReactionFromCache(key: string, username: string, commentReactions: IReactions): Promise<void> {
    try {
      if (!this.client.isOpen) {
        this.client.connect();
      }
      const response: string[] = await this.client.LRANGE(`reactions:${key}`, 0, -1);
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      const userPreviousReaction: IReactionDocument = this.getPreviousCommentReaction(response, username, key) as IReactionDocument;
      multi.LREM(`reactions:${key}`, 1, JSON.stringify(userPreviousReaction));
      await multi.exec();
      await this.client.HSET(`comments:${key}`, 'reactions', JSON.stringify(commentReactions));
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  private getPreviousPostReaction(response: string[], username: string, postId: string): IReactionDocument | undefined {
    const list: IReactionDocument[] = [];
    for (const item of response) {
      const reactionItem: IReactionDocument = SupportiveMethods.parseJson(item) as IReactionDocument;
      if (reactionItem.postId == postId) {
        list.push(reactionItem);
      }
    }

    return find(list, (listItem: IReactionDocument) => {
      return listItem.username === username;
    });
  }

  private getPreviousCommentReaction(response: string[], username: string, commentId: string): IReactionDocument | undefined {
    const list: IReactionDocument[] = [];
    for (const item of response) {
      const reactionItem: IReactionDocument = SupportiveMethods.parseJson(item) as IReactionDocument;
      if (reactionItem.commentId == commentId) {
        list.push(reactionItem);
      }
    }

    return find(list, (listItem: IReactionDocument) => {
      return listItem.username === username;
    });
  }

  public async getCommentReaction(commentId: string, username: string): Promise<[IReactionDocument[], number]> {
    try {
      if (!this.client.isOpen) {
        this.client.connect();
      }
      const list: IReactionDocument[] = [];
      const response: string[] = await this.client.LRANGE(`reactions:${commentId}`, 0, -1);
      const numberOfReactions: number = await this.client.LLEN(`reactions:${commentId}`);
      for (const item of response) {
        const reaction: IReactionDocument = SupportiveMethods.parseJson(item);
        if(reaction.username === username)
          reaction.liked = true;
        else reaction.liked = false;
        list.push(reaction);
      }
      return [list, numberOfReactions];
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getPostReaction(postId: string, username: string): Promise<[IReactionDocument[], number]> {
    try {
      if (!this.client.isOpen) {
        this.client.connect();
      }
      const list: IReactionDocument[] = [];
      const response: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1);
      const numberOfReactions: number = await this.client.LLEN(`reactions:${postId}`);
      for (const item of response) {
        const reaction: IReactionDocument = SupportiveMethods.parseJson(item);
        if(reaction.username === username)
          reaction.liked = true;
        else reaction.liked = false;
        list.push(reaction);
      }
      return [list, numberOfReactions];
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getSinglePostReaction(postId: string, username: string): Promise<IReactionDocument> {
    try {
      if (!this.client.isOpen) {
        this.client.connect();
      }
      const list: IReactionDocument[] = [];
      const response: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1);
      for (const item of response) {
        list.push(SupportiveMethods.parseJson(item));
      }

      const result: IReactionDocument = find(list, (listItem: IReactionDocument) => {
        return listItem.postId === postId && listItem.username === username;
      }) as IReactionDocument;
      return result;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getSingleCommentReaction(commentId: string, username: string): Promise<IReactionDocument> {
    try {
      if (!this.client.isOpen) {
        this.client.connect();
      }
      const list: IReactionDocument[] = [];
      const response: string[] = await this.client.LRANGE(`reactions:${commentId}`, 0, -1);
      for (const item of response) {
        list.push(SupportiveMethods.parseJson(item));
      }

      const result: IReactionDocument = find(list, (listItem: IReactionDocument) => {
        return listItem.commentId === commentId && listItem.username === username;
      }) as IReactionDocument;
      return result;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}
