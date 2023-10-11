import { CommentCache } from '@root/shared/services/redis/comment.cache';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';
import { ICommentDocument, ICommentNameList } from '@comment/interfaces/comment.interface';
import { commentService } from '@service/db/comment.service';
import mongoose from 'mongoose';

const commentCache: CommentCache = new CommentCache();
export class Get {
  public async comments(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const cachedComment: ICommentDocument[] =  await commentCache.getCommentsFromCache(postId);
    const comments: ICommentDocument[] = cachedComment.length ? cachedComment :
    await commentService.getCommentsFromDB({ postId: new mongoose.Types.ObjectId(postId)}, { createdAt: -1});

    res.status(STATUS_CODE.OK).json({ message: 'Post comments', comments});
  }

  public async commentNames(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const cachedComment: ICommentNameList[] = await commentCache.getCommentUsernamesFromCache(postId);
    const commentNames: ICommentNameList[] = cachedComment.length ? cachedComment :
    await commentService.getCommentNamesFromDB({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1});

    res.status(STATUS_CODE.OK).json({ message: 'Post comment names', commentNames});
  }

  public async singleComment(req: Request, res: Response): Promise<void> {
    const { postId, commentId } = req.params;
    const cachedComment: ICommentDocument[] = await commentCache.getSingleCommentFromAPostFromCache(postId, commentId);
    const singleComment: ICommentDocument[] = cachedComment.length ? cachedComment :
    await commentService.getCommentsFromDB({_id: new mongoose.Types.ObjectId(commentId)}, { createdAt: -1});

    res.status(STATUS_CODE.OK).json({ message: 'single comment', singleComment});
  }
}
