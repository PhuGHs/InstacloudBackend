import { BaseQueue } from './base.queue';
import { followerWorker } from '@worker/follower.worker';
import { IFollowerJobData } from '@follower/interfaces/follower.interface';
import { imageWorker } from '@worker/image.worker';
import { IFileImageJobData } from '@image/interfaces/image.interface';

class ImageQueue extends BaseQueue {
  constructor() {
    super('videoQueue');
    this.processJob('addImageToDB', 5, imageWorker.addImageToDB);
    this.processJob('removeImageFromDB', 5, imageWorker.removeImageFromDB);
  }

  public addImageJob(name: string, data: IFileImageJobData) {
    this.addJob(name, data);
  }
}

export const imageQueue: ImageQueue = new ImageQueue();
