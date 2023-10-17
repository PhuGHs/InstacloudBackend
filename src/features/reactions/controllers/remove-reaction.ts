import { IReactionJob } from '@reaction/interfaces/reaction.interface';
import { reactionQueue } from '@service/queues/reaction.queue';
import { ReactionCache } from '@service/redis/reaction.cache';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';

const reactionCache: ReactionCache = new ReactionCache();
export class Remove {
  public async postReaction(req: Request, res: Response): Promise<void> {
    const { postId, postReactions } = req.params;

    const dataJob: IReactionJob = {
      postId,
      username: req.currentUser!.username
    } as IReactionJob;
    await reactionCache.removeReactionFromCache(postId, req.currentUser!.username, JSON.parse(postReactions));
    reactionQueue.addReactionJob('removePostReactionFromDB', dataJob);
    res.status(STATUS_CODE.OK).json({ message: 'You have removed your reaction from the post'});
  }

  public async commentReaction(req: Request, res: Response): Promise<void> {
    const { commentId, commentReactions } = req.params;
    const dataJob: IReactionJob = {
      commentId,
      username: req.currentUser!.username
    } as IReactionJob;
    await reactionCache.removeCommentReactionFromCache(commentId, req.currentUser!.username, JSON.parse(commentReactions));
    reactionQueue.addReactionJob('removeCommentReactionFromDB', dataJob);
    res.status(STATUS_CODE.OK).json({ message: 'You have removed your reaction from the comment'});
  }
}
