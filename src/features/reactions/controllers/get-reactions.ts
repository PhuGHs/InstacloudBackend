import { IReactionDocument } from '@reaction/interfaces/reaction.interface';
import { reactionService } from '@service/db/reaction.service';
import { ReactionCache } from '@service/redis/reaction.cache';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import STATUS_CODE from 'http-status-codes';

const reactionCache: ReactionCache = new ReactionCache();
export class Get {
  public async postReactions(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const cachedReaction: [IReactionDocument[], number] = await reactionCache.getPostReaction(postId, req.currentUser!.username);
    const reactions: [IReactionDocument[], number] = cachedReaction[0].length
      ? cachedReaction
      : await reactionService.getPostReactions({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });
    res.status(STATUS_CODE.OK).json({ message: 'post reactions', reactions });
  }

  public async commentReactions(req: Request, res: Response): Promise<void> {
    const { commentId } = req.params;
    const cachedReaction: [IReactionDocument[], number] = await reactionCache.getCommentReaction(commentId, req.currentUser!.username);
    const reactions: [IReactionDocument[], number] = cachedReaction[0].length
      ? cachedReaction
      : await reactionService.getPostReactions({ commentId: new mongoose.Types.ObjectId(commentId) }, { createdAt: -1 });
    res.status(STATUS_CODE.OK).json({ message: 'post reactions', reactions });
  }

  public async singlePostReaction(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const cachedReaction: IReactionDocument = await reactionCache.getSinglePostReaction(postId, req.currentUser!.username);
    const reaction: IReactionDocument = cachedReaction
      ? cachedReaction
      : await reactionService.getSingleReaction(
          { postId: new mongoose.Types.ObjectId(postId), username: req.currentUser!.username },
          { createdAt: -1 }
        );
    res.status(STATUS_CODE.OK).json({ message: 'single post reaction', reaction });
  }

  public async singleCommentReaction(req: Request, res: Response): Promise<void> {
    const { commentId } = req.params;
    const cachedReaction: IReactionDocument = await reactionCache.getSingleCommentReaction(commentId, req.currentUser!.username);
    const reaction: IReactionDocument = cachedReaction
      ? cachedReaction
      : await reactionService.getSingleReaction(
          { postId: new mongoose.Types.ObjectId(commentId), username: req.currentUser!.username },
          { createdAt: -1 }
        );
    res.status(STATUS_CODE.OK).json({ message: 'single comment reaction', reaction });
  }
}
