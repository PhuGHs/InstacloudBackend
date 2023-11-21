import { IFileImageDocument } from '@image/interfaces/image.interface';
import { imageService } from '@service/db/image.service';
import { imageQueue } from '@service/queues/image.queue';
import { socketIOImageObject } from '@socket/image.socket';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';

export class Delete {
  public async image(req: Request, res: Response): Promise<void> {
    const { imageId } = req.params;
    imageQueue.addImageJob('removeImageFromDB', { key: imageId });
    socketIOImageObject.emit('delete image', imageId);
    res.status(STATUS_CODE.OK).json({ message: 'The image has been removed!' });
  }
}
