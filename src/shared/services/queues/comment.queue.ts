import { commentWorker } from '@root/shared/workers/comment.worker';
import { BaseQueue } from './base.queue';
import { ICommentJob, IUpdateCommentJob } from '@root/features/comments/interfaces/comment.interface';

class CommentQueue extends BaseQueue {
  constructor() {
    super('commentQueue');
    this.processJob('addCommentToDB', 5, commentWorker.addCommentToDB);
    this.processJob('updateACommentInDB', 5, commentWorker.updateACommentInDB);
    this.processJob('deleteACommentInDB', 5, commentWorker.deleteACommentInDB);
  }

  public addCommentJob(name: string, data: ICommentJob | IUpdateCommentJob) {
    this.addJob(name, data);
  }
}

export const commentQueue: CommentQueue = new CommentQueue();
