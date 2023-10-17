import { IReactionJob } from '@reaction/interfaces/reaction.interface';
import { BaseQueue } from '@service/queues/base.queue';
import { reactionWorker } from '@worker/reaction.worker';

class ReactionQueue extends BaseQueue {
  constructor() {
    super('reactionQueue');
    this.processJob('addPostReactionToDB', 5, reactionWorker.addPostReactionToDB);
    this.processJob('addCommentReactionToDB', 5, reactionWorker.addCommentReactionToDB);
    this.processJob('removePostReactionFromDB', 5, reactionWorker.removePostReactionFromDB);
    this.processJob('removeCommentReactionFromDB', 5, reactionWorker.removeCommentReactionFromDB);
  }

  public addReactionJob(name: string, data: IReactionJob): void {
    this.addJob(name, data);
  }
}

export const reactionQueue: ReactionQueue = new ReactionQueue();
