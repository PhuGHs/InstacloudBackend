import { ICommentDocument, IUpdateCommentJob } from '@comment/interfaces/comment.interface';
import { updateCommentSchema } from '@comment/schemes/comment.scheme';
import { joiValidation } from '@global/decorators/joi.validation';
import { commentQueue } from '@service/queues/comment.queue';
import { CommentCache } from '@service/redis/comment.cache';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';

const commentCache: CommentCache = new CommentCache();
export class Update {
  @joiValidation(updateCommentSchema)
  public async comment(req: Request, res: Response): Promise<void> {
    const { comment, profilePicture } = req.body;
    const { commentId } = req.params;

    const updatedComment: ICommentDocument = {
      comment,
      profilePicture
    } as ICommentDocument;

    const commentAfterBeingUpdated: ICommentDocument = await commentCache.updateACommentInCache(commentId, updatedComment);
    commentQueue.addCommentJob('updateACommentInDB', { key: commentId, value: updatedComment });
    res.status(STATUS_CODE.OK).json({ message: 'updated comment sucessfully ', updatedComment: commentAfterBeingUpdated });
  }
}
