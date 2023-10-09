import { config } from '@root/config';
import { IReactionDocument, IReactions } from '@root/features/reactions/interfaces/reaction.interface';
import { ServerError } from '@root/shared/globals/helpers/error-handler';
import { BaseCache } from '@service/redis/base.cache';
import Logger from 'bunyan';

const log: Logger = config.createLogger('reactionCache');
export class ReactionCache extends BaseCache {
  constructor() {
    super('reactionCache');
  }
  public async addReactionToCache(key: string, reaction: IReactionDocument, postReactions: IReactions, type: 'post' | 'comment'): Promise<void> {
    try {
      if(!this.client.isOpen) {
        this.client.connect();
      }

    } catch(error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}
