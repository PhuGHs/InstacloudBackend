import { CommentCache } from '@root/shared/services/redis/comment.cache';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';
import { ICommentDocument, ICommentNameList } from '@comment/interfaces/comment.interface';
import { commentService } from '@service/db/comment.service';
import mongoose from 'mongoose';
import { config } from '@root/config';
import Logger from 'bunyan';
import { IUserDocument } from '@user/interfaces/user.interface';
import { userService } from '@service/db/user.service';
import { UserCache } from '@service/redis/user.cache';

const log: Logger = config.createLogger('checkCache');
const commentCache: CommentCache = new CommentCache();
const userCache: UserCache = new UserCache();
export class Get {
  public async comments(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const cachedUser: IUserDocument = (await userCache.getUserFromCache(req.currentUser!.userId)) as IUserDocument;
    const user: IUserDocument = cachedUser ? cachedUser : await userService.getUserById(req.currentUser!.userId);
    const userIds: mongoose.Types.ObjectId[] = [];
    for(const blockedUser of [...user.blocked, ...user.blockedBy]) {
      userIds.push(new mongoose.Types.ObjectId(blockedUser));
    }
    const cachedComment: ICommentDocument[] = await commentCache.getCommentsFromCache('comment', postId);
    const comments: ICommentDocument[] = cachedComment.length
      ? cachedComment
      : await commentService.getCommentsFromDB({ postId: new mongoose.Types.ObjectId(postId), userId: { $nin: userIds } }, { createdAt: -1 });

    res.status(STATUS_CODE.OK).json({ message: 'Post comments', comments });
  }

  public async commentNames(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const cachedUser: IUserDocument = (await userCache.getUserFromCache(req.currentUser!.userId)) as IUserDocument;
    const user: IUserDocument = cachedUser ? cachedUser : await userService.getUserById(req.currentUser!.userId);
    const userIds: mongoose.Types.ObjectId[] = [];
    for(const blockedUser of [...user.blocked, ...user.blockedBy]) {
      userIds.push(new mongoose.Types.ObjectId(blockedUser));
    }
    const cachedComment: ICommentNameList[] = await commentCache.getCommentUsernamesFromCache('comment', postId);
    const commentNames: ICommentNameList[] = cachedComment[0].names.length
      ? cachedComment
      : await commentService.getCommentNamesFromDB({ postId: new mongoose.Types.ObjectId(postId), userId: { $nin: userIds } }, { createdAt: -1 });

    res.status(STATUS_CODE.OK).json({ message: 'Post comment names', commentNames });
  }

  public async singleComment(req: Request, res: Response): Promise<void> {
    const { postId, commentId } = req.params;
    const cachedComment: ICommentDocument[] = await commentCache.getSingleCommentFromAPostFromCache(postId, commentId);
    const singleComment: ICommentDocument[] = cachedComment.length
      ? cachedComment
      : await commentService.getCommentsFromDB({ _id: new mongoose.Types.ObjectId(commentId) }, { createdAt: -1 });

    res.status(STATUS_CODE.OK).json({ message: 'single comment', singleComment });
  }
}
