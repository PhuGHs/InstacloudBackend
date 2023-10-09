import { Request, Response } from 'express';
import { IPostDocument } from '../interfaces/post.interface';
import { PostCache } from '@root/shared/services/redis/post.cache';
import { postQueue } from '@root/shared/services/queues/post.queue';
import STATUS_CODE from 'http-status-codes';
import { joiValidation } from '@root/shared/globals/decorators/joi.validation';
import { postSchema } from '../schemes/post.scheme';
import { UploadApiResponse } from 'cloudinary';
import { upload } from '@root/shared/globals/helpers/cloudinary-upload';
import { BadRequestError } from '@root/shared/globals/helpers/error-handler';

const postCache: PostCache = new PostCache();
export class Update {
  @joiValidation(postSchema)
  public async post(req: Request, res: Response): Promise<void> {
    const { post, privacy, gifUrl, feelings, imgId, imgVersion, profilePicture } = req.body;
    const { postId } = req.params;

    const updatedPost: IPostDocument = {
      post,
      privacy,
      gifUrl,
      feelings,
      imgId,
      imgVersion,
      profilePicture,
    } as IPostDocument;

    const postInCacheAfterBeingUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    //call socketIO to update in the UI.
    postQueue.addPostJob('updatePostInDB', { key: postId, value: updatedPost });
    res.status(STATUS_CODE.OK).json({ message: 'Post has been updated successfully!', post: postInCacheAfterBeingUpdated});
  }

  public async postWithImage(req: Request, res: Response): Promise<void> {
    const { imgId, imgVersion } = req.body;
    if (imgId && imgVersion ) {
      Update.prototype.updateImage(req);
    } else {
      const result: UploadApiResponse = await Update.prototype.addNewImage(req);
      if(!result.public_id) {
        throw new BadRequestError(result.message);
      }
    }
    res.status(STATUS_CODE.OK).json({ message: 'post with image has been updated successfully'});
  }

  private async updateImage(req: Request): Promise<void> {
    const { post, feelings, privacy, gifUrl, imgId, imgVersion, profilePicture } = req.body;
    const { postId } = req.params;

    const updatedPost: IPostDocument = {
      post,
      feelings,
      privacy,
      gifUrl,
      imgId,
      imgVersion,
      profilePicture,
    } as IPostDocument;

    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    postQueue.addPostJob('updatePostInDB', { key: postId, value: postUpdated});
  }

  private async addNewImage(req: Request): Promise<UploadApiResponse> {
    const { post, feelings, privacy, gifUrl, profilePicture, image } = req.body;
    const { postId } = req.params;

    const result : UploadApiResponse = await upload(image) as UploadApiResponse;

    if(!result?.public_id) { // if has error, dont return public_id
      return result;
    }

    const updatedPost: IPostDocument = {
      post,
      feelings,
      privacy,
      gifUrl,
      imgId: result.public_id,
      imgVersion: result.version.toString(),
      profilePicture,
    } as IPostDocument;

    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    postQueue.addPostJob('updatePostInDB', { key: postId, value: postUpdated});

    return result;
  }
}
