import { commentWorker } from '@root/shared/workers/comment.worker';
import { BaseQueue } from './base.queue';
import { ICommentJob } from '@root/features/comments/interfaces/comment.interface';

class CommentQueue extends BaseQueue {
  constructor() {
    super('commentQueue');
    this.processJob('addCommentToDB', 5, commentWorker.addCommentToDB);
  }

  public addCommentJob(name: string, data: ICommentJob) {
    this.addJob(name, data);
  }
}

export const commentQueue: CommentQueue = new CommentQueue();
