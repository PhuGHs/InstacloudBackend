import { commentQueue } from '@service/queues/comment.queue';
import { CommentCache } from '@service/redis/comment.cache';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';
const commentCache: CommentCache = new CommentCache();
export class Delete {
  public async comment(req: Request, res: Response): Promise<void> {
    const { commentId, postId } = req.params;
    await commentCache.deleteAComment(commentId, postId);
    commentQueue.addCommentJob('deleteACommentInDB', { keyOne: commentId, keyTwo: postId });
    res.status(STATUS_CODE.OK).json({ message: 'the comment has been deleted successfully! ' });
  }
}
