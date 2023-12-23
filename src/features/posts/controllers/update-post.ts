import { Request, Response } from 'express';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostCache } from '@root/shared/services/redis/post.cache';
import { postQueue } from '@root/shared/services/queues/post.queue';
import STATUS_CODE from 'http-status-codes';
import { joiValidation } from '@root/shared/globals/decorators/joi.validation';
import { postSchema, postWithImageSchema, postWithVideoSchema } from '@post/schemes/post.scheme';
import { UploadApiResponse } from 'cloudinary';
import { upload, vidUpload } from '@root/shared/globals/helpers/cloudinary-upload';
import { BadRequestError } from '@root/shared/globals/helpers/error-handler';
import { imageQueue } from '@service/queues/image.queue';
import { socketIOPostObject } from '@socket/post.socket';
import { postService } from '@service/db/post.service';

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
      profilePicture
    } as IPostDocument;

    const postInCacheAfterBeingUpdated: IPostDocument | null = await postCache.updatePostInCache(postId, updatedPost);
    //call socketIO to update in the UI.
    socketIOPostObject.emit('update post', postInCacheAfterBeingUpdated, 'posts');
    postQueue.addPostJob('updatePostInDB', { key: postId, value: updatedPost });
    const returnedPost: IPostDocument = postInCacheAfterBeingUpdated ? postInCacheAfterBeingUpdated : await postService.getSinglePost(postId);
    res.status(STATUS_CODE.OK).json({ message: 'Post has been updated successfully!', post: returnedPost });
  }

  @joiValidation(postWithImageSchema)
  public async postWithImage(req: Request, res: Response): Promise<void> {
    const { imgId, imgVersion } = req.body;
    if (imgId && imgVersion) {
      Update.prototype.updatePost(req);
    } else {
      const result: UploadApiResponse = await Update.prototype.addNewFile(req);
      if (!result.public_id) {
        throw new BadRequestError(result.message);
      }
    }

    res.status(STATUS_CODE.OK).json({ message: 'post with image has been updated successfully' });
  }

  @joiValidation(postWithVideoSchema)
  public async postWithVideo(req: Request, res: Response): Promise<void> {
    const { videoId, videoVersion } = req.body;
    if (videoId && videoVersion) {
      Update.prototype.updatePost(req);
    } else {
      const result: UploadApiResponse = await Update.prototype.addNewFile(req);
      if (!result.public_id) {
        throw new BadRequestError(result.message);
      }
    }
    res.status(STATUS_CODE.OK).json({ message: 'post with video has been updated successfully' });
  }

  private async updatePost(req: Request): Promise<void> {
    const { post, feelings, privacy, gifUrl, imgId, imgVersion, profilePicture, videoId, videoVersion } = req.body;
    const { postId } = req.params;

    const updatedPost: IPostDocument = {
      post,
      feelings,
      privacy,
      gifUrl,
      imgId: imgId ? imgId : '',
      imgVersion: imgVersion ? imgVersion : '',
      profilePicture,
      videoId: videoId ? videoId : '',
      videoVersion: videoVersion ? videoVersion : ''
    } as IPostDocument;

    const postUpdated: IPostDocument | null = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');
    const returnedPost: IPostDocument = postUpdated ? postUpdated : await postService.getSinglePost(postId);
    postQueue.addPostJob('updatePostInDB', { key: postId, value: returnedPost });
  }

  private async addNewFile(req: Request): Promise<UploadApiResponse> {
    const { post, feelings, privacy, gifUrl, profilePicture, image, video } = req.body;
    const { postId } = req.params;

    const result: UploadApiResponse = image
      ? ((await upload(image)) as UploadApiResponse)
      : ((await vidUpload(video)) as UploadApiResponse);

    if (!result?.public_id) {
      // if has error, dont return public_id
      return result;
    }

    const updatedPost: IPostDocument = {
      post,
      feelings,
      privacy,
      gifUrl,
      imgId: image ? result.public_id : '',
      imgVersion: image ? result.version.toString() : '',
      videoId: video ? result.public_id : '',
      videoVersion: video ? result.version.toString() : '',
      profilePicture
    } as IPostDocument;

    const postUpdated: IPostDocument | null = await postCache.updatePostInCache(postId, updatedPost);
    const returnedPost: IPostDocument = postUpdated ? postUpdated : await postService.getSinglePost(postId);
    postQueue.addPostJob('updatePostInDB', { key: postId, value: returnedPost });
    if (image) {
      imageQueue.addImageJob('addImageToDB', {
        key: req.currentUser!.userId,
        imgId: result.public_id,
        imgVersion: result.version.toString()
      });
    }

    return result;
  }
}
