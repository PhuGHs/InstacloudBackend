import { joiValidation } from '@root/shared/globals/decorators/joi.validation';
import { Request, Response } from 'express';
import { addCommentSchema } from '@comment/schemes/comment.scheme';
import { ObjectId } from 'mongodb';
import { ICommentDocument, ICommentJob } from '@comment/interfaces/comment.interface';
import { CommentCache } from '@service/redis/comment.cache';
import { commentQueue } from '@service/queues/comment.queue';
import STATUS_CODE from 'http-status-codes';

const commentCache: CommentCache = new CommentCache();
export class Add {
  @joiValidation(addCommentSchema)
  public async comment(req: Request, res: Response): Promise<void> {
    const { profilePicture, userTo, postId, comment } = req.body;

    const commentObjectId: ObjectId = new ObjectId();
    const data: ICommentDocument = {
      _id: commentObjectId,
      username: req.currentUser!.username,
      userId: req.currentUser!.userId,
      postId,
      userTo,
      profilePicture,
      comment,
      createdAt: new Date(),
      reactions: { like: 0 }
    } as ICommentDocument;

    const workerData: ICommentJob = {
      comment: data,
      postId: postId,
      userTo,
      userFrom: req.currentUser!.userId,
      userFromProfilePicture: profilePicture,
      username: req.currentUser!.username
    };
    await commentCache.addCommentToCache({ commentId: `${commentObjectId}`, commentData: data });
    commentQueue.addCommentJob('addCommentToDB', workerData);
    res.status(STATUS_CODE.OK).json({ message: 'Your comment has been added.' });
  }
}
