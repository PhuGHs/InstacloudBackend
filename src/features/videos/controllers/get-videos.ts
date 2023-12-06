import { videoService } from '@service/db/video.service';
import { IFileVideoDocument } from '@video/interfaces/video.interface';
import { Request, Response } from 'express';
import STATUS_CODES from 'http-status-codes';

export class Get {
  public async videos(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const videos: IFileVideoDocument[] = await videoService.getVideos(userId);
    res.status(STATUS_CODES.OK).json({ message: 'get video successfully!', videos});
  }
}
