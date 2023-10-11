import { ICommentDocument, ICommentJob, ICommentNameList, IQueryComment } from '@comment/interfaces/comment.interface';
import { CommentsModel } from '@root/features/comments/models/comment.schema';
import { IPostDocument } from '@root/features/posts/interfaces/post.interface';
import { PostModel } from '@root/features/posts/models/post.schema';
import { IUserDocument } from '@root/features/users/interfaces/user.interface';
import { Query } from 'mongoose';
import { UserCache } from '@service/redis/user.cache';

const userCache: UserCache = new UserCache();
class CommentService {
  public async addCommentToDB(data: ICommentJob): Promise<void> {
    const { postId, userTo, userFrom, username, comment } = data;
    const promisedComment: Promise<ICommentDocument> = CommentsModel.create(comment);
    const promisedPost: Query<IPostDocument, IPostDocument> = PostModel.findOneAndUpdate(
      { _id: postId },
      { $inc: { commentsCount: 1 }},
      { new: true }
    ) as Query<IPostDocument, IPostDocument>;
    const promisedUser: Promise<IUserDocument> = userCache.getUserFromCache(userTo) as Promise<IUserDocument>;
    const response: [ICommentDocument, IPostDocument, IUserDocument] = await Promise.all([promisedComment, promisedPost, promisedUser]);

    // add comment notification


    // send to client with SOCKETIO


    // email to user
  }

  public async getCommentsFromDB(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentDocument[]> {
    const comments: ICommentDocument[] = await CommentsModel.aggregate([
      { $match: query },
      { $sort: sort }
    ]);
    return comments;
  }

  public async getCommentNamesFromDB(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentNameList[]> {
    const commentNamesList: ICommentNameList[] = await CommentsModel.aggregate([
      { $match: query },
      { $sort: sort },
      { $group: { _id: null, names: { $addToSet: '$username'}, count: { $sum: 1 }}},
      { $project: { _id: 0 }}
    ]);

    return commentNamesList;
  }
}

export const commentService: CommentService = new CommentService();
