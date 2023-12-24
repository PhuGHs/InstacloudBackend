import { joiValidation } from '@global/decorators/joi.validation';
import { upload } from '@global/helpers/cloudinary-upload';
import { BadRequestError } from '@global/helpers/error-handler';
import { addImageSchema } from '@image/schemes/image.scheme';
import { imageQueue } from '@service/queues/image.queue';
import { UserCache } from '@service/redis/user.cache';
import { socketIOImageObject } from '@socket/image.socket';
import { socketIOUserObject } from '@socket/user.socket';
import { UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';

const userCache: UserCache = new UserCache();
export class Add {
  @joiValidation(addImageSchema)
  public async image(req: Request, res: Response): Promise<void> {
    const { image } = req.body;
    const result: UploadApiResponse = (await upload(image, req.currentUser!.userId, true, true)) as UploadApiResponse;
    if (!result.public_id) {
      throw new BadRequestError('File upload error');
    }
    const createdUrl: string = `https://res.cloudinary.com/daszajz9a/image/upload/v${result.version}/${result.public_id}`;
    const cachedUser = await userCache.updateSingleItemInCache(req.currentUser!.userId, 'profilePicture', createdUrl);
    console.log(cachedUser.profilePicture);
    socketIOImageObject.emit('update user', cachedUser);
    imageQueue.addImageJob('addImageToDB', {
      userId: req.currentUser!.userId,
      imgId: result.public_id!,
      imgVersion: result.version.toString()
    });
    res.status(STATUS_CODE.OK).json({ message: 'profile image has been updated' });
  }
}
