import { IFileImageDocument } from '@image/interfaces/image.interface';
import { imageService } from '@service/db/image.service';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';

export class Get {
  public async images(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const images: IFileImageDocument[] = await imageService.getImagesFromDB(userId);
    res.status(STATUS_CODE.OK).json({ message: 'image gallery', images });
  }
}
