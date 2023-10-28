import { joiValidation } from '@global/decorators/joi.validation';
import { IReactionDocument, IReactionJob } from '@reaction/interfaces/reaction.interface';
import { addCommentReactionSchema, addPostReactionSchema } from '@reaction/schemes/reaction.scheme';
import { reactionQueue } from '@service/queues/reaction.queue';
import { ReactionCache } from '@service/redis/reaction.cache';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import STATUS_CODE from 'http-status-codes';

const reactionCache: ReactionCache = new ReactionCache();
export class Add {
  @joiValidation(addPostReactionSchema)
  public async reaction(req: Request, res: Response): Promise<void> {
    const { postId, userTo, profilePicture, postReactions } = req.body;
    const reactionObjectId: ObjectId = new ObjectId();
    const reactionDocument: IReactionDocument = {
      _id: reactionObjectId,
      username: req.currentUser!.username,
      postId,
      profilePicture,
      createdAt: new Date(),
      userTo
    } as IReactionDocument;
    const reactionJob: IReactionJob = {
      postId,
      username: req.currentUser!.username,
      userTo,
      userFrom: req.currentUser!.userId,
      reactionObject: reactionDocument
    };
    await reactionCache.addPostReactionToCache(postId, reactionDocument, postReactions);
    reactionQueue.addReactionJob('addPostReactionToDB', reactionJob);
    res.status(STATUS_CODE.OK).json({ message: 'Your post reaction has been added.' });
  }

  @joiValidation(addCommentReactionSchema)
  public async commentReaction(req: Request, res: Response): Promise<void> {
    const { commentId, userTo, profilePicture, postReactions } = req.body;
    const reactionObjectId: ObjectId = new ObjectId();
    const reactionDocument: IReactionDocument = {
      _id: reactionObjectId,
      username: req.currentUser!.username,
      commentId,
      profilePicture,
      createdAt: new Date(),
      userTo
    } as IReactionDocument;
    const reactionJob: IReactionJob = {
      commentId,
      username: req.currentUser!.username,
      userTo,
      userFrom: req.currentUser!.userId,
      reactionObject: reactionDocument
    };
    await reactionCache.addCommentReactionToCache(commentId, reactionDocument, postReactions);
    reactionQueue.addReactionJob('addCommentReactionToDB', reactionJob);
    res.status(STATUS_CODE.OK).json({ message: 'Your comment reaction has been added.' });
  }
}
