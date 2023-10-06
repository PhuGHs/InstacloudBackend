import { joiValidation } from '@root/shared/globals/decorators/joi.validation';
import { postSchema, postWithImageSchema } from '@post/schemes/post.scheme';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { IPostDocument, ISavePostToCache } from '../interfaces/post.interface';
import { PostCache } from '@root/shared/services/redis/post.cache';
import { postQueue } from '@root/shared/services/queues/post.queue';
import STATUS_CODE from 'http-status-codes';
import { UploadApiResponse } from 'cloudinary';
import { upload } from '@root/shared/globals/helpers/cloudinary-upload';
import { BadRequestError } from '@root/shared/globals/helpers/error-handler';

const postCache: PostCache = new PostCache();
export class Create {
  @joiValidation(postSchema)
  public async post(req: Request, res: Response): Promise<void> {
    const { post, privacy, gifUrl, profilePicture, feelings } = req.body;
    const postObjectId: ObjectId = new ObjectId();
    const userPost: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      profilePicture,
      post,
      privacy,
      gifUrl,
      feelings,
      commentsCount: 0,
      imgVersion: '',
      imgId: '',
      createdAt: new Date(),
      reactions: { like: 0 }
    } as IPostDocument;

    const data: ISavePostToCache = {
      key: `${postObjectId}`,
      currentUserId: req.currentUser!.userId,
      uId: req.currentUser!.uId,
      createdPost: userPost,
    } as ISavePostToCache;
    await postCache.savePostToCache(data);
    postQueue.addPostJob('savePostToDB', { key: req.currentUser!.userId, value: userPost});
    res.status(STATUS_CODE.OK).json({message: 'post created successfully!', post: userPost});
  }

  @joiValidation(postWithImageSchema)
  public async postWithImage(req: Request, res: Response): Promise<void> {
    const { post, privacy, gifUrl, profilePicture, feelings, image } = req.body;
    const postObjectId: ObjectId = new ObjectId();

    const result: UploadApiResponse = await upload(image) as UploadApiResponse;
    if(!result?.public_id) {
      throw new BadRequestError('File upload error. Please try again!');
    }

    const userPost: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      profilePicture,
      post,
      privacy,
      gifUrl,
      feelings,
      commentsCount: 0,
      imgVersion: `${result.version}`,
      imgId: result.public_id.toString(),
      createdAt: new Date(),
      reactions: { like: 0 }
    } as IPostDocument;

    const data: ISavePostToCache = {
      key: `${postObjectId}`,
      currentUserId: req.currentUser!.userId,
      uId: req.currentUser!.uId,
      createdPost: userPost,
    } as ISavePostToCache;
    await postCache.savePostToCache(data);
    postQueue.addPostJob('savePostWithImageToDB', { key: req.currentUser!.userId, value: userPost});
    // call image queue to add image to mongodb database
    res.status(STATUS_CODE.OK).json({message: 'post with image created successfully!', post: userPost});
  }
}