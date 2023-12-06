import { videoQueue } from '@service/queues/video.queue';
import { Request, Response } from 'express';
import STATUS_CODES from 'http-status-codes';

export class Remove {
  public async video(req: Request, res: Response): Promise<void> {
    const { videoId, videoVersion } = req.params;
    videoQueue.addVideoJob('removeVideoFromDB', {
      key1: videoId,
      key2: videoVersion
    });
    res.status(STATUS_CODES.OK).json({ message: 'remove video from DB successfully!'});
  }
}
