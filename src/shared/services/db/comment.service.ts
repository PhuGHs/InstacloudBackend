import { ICommentDocument, ICommentJob } from '@comment/interfaces/comment.interface';
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
}

export const commentService: CommentService = new CommentService();
