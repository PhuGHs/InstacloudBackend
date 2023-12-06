import { BaseQueue } from './base.queue';
import { IFileVideoJob } from '@video/interfaces/video.interface';
import { videoWorker } from '@worker/video.worker';

class VideoQueue extends BaseQueue {
  constructor() {
    super('videoQueue');
    this.processJob('removeVideoFromDB', 5, videoWorker.removeVideoFromDB);
    this.processJob('addVideoToDB', 5, videoWorker.removeVideoFromDB);
  }

  public addVideoJob(name: string, data: IFileVideoJob) {
    this.addJob(name, data);
  }
}

export const videoQueue: VideoQueue = new VideoQueue();
