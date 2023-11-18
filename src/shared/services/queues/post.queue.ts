import { BaseQueue } from './base.queue';
import { IPostJobData, ISavePostJob } from '@root/features/posts/interfaces/post.interface';
import { postWorker } from '@root/shared/workers/post.worker';

class PostQueue extends BaseQueue {
  constructor() {
    super('post');
    this.processJob('savePostToDB', 5, postWorker.savePostToDB);
    this.processJob('savePostWithImageToDB', 5, postWorker.savePostToDB);
    this.processJob('savePostWithVideoToDB', 5, postWorker.savePostToDB);
    this.processJob('updatePostInDB', 5, postWorker.updatePost);
    this.processJob('deleteAPostInDB', 5, postWorker.deletePost);
    this.processJob('saveOtherPostsToDB', 5, postWorker.saveOtherPostsToDB);
  }

  public addPostJob(name: string, data: IPostJobData | ISavePostJob): void {
    this.addJob(name, data);
  }
}

export const postQueue: PostQueue = new PostQueue();
