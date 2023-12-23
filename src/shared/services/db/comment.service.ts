import { ICommentDocument, ICommentJob, ICommentNameList, IQueryComment } from '@comment/interfaces/comment.interface';
import { CommentsModel } from '@root/features/comments/models/comment.schema';
import { IPostDocument, IQueryComplete, IQueryDeleted } from '@root/features/posts/interfaces/post.interface';
import { PostModel } from '@root/features/posts/models/post.schema';
import { IUserDocument } from '@root/features/users/interfaces/user.interface';
import mongoose, { Query, UpdateQuery } from 'mongoose';
import { UserCache } from '@service/redis/user.cache';
import { INotificationDocument } from '@notification/interfaces/notification.interface';
import { NotificationModel } from '@notification/models/notification.schema';
import { userService } from './user.service';

const userCache: UserCache = new UserCache();
class CommentService {
  public async addCommentToDB(data: ICommentJob): Promise<void> {
    const { postId, userTo, userFrom, username, comment, userFromProfilePicture } = data;
    const promisedComment: Promise<ICommentDocument> = CommentsModel.create(comment);
    console.log(postId);
    const promisedPost: Query<IPostDocument, IPostDocument> = PostModel.findOneAndUpdate(
      { _id: postId },
      { $inc: { commentsCount: 1 } },
      { new: true }
    ) as Query<IPostDocument, IPostDocument>;
    const promisedUser: IUserDocument = await userCache.getUserFromCache(userTo) as IUserDocument;
    const user: IUserDocument = promisedUser ? promisedUser : await userService.getUserById(userTo) as IUserDocument;

    const response: [ICommentDocument, IPostDocument] = await Promise.all([promisedComment, promisedPost]);

    // add comment notification
    if (user.notifications.comments && userTo !== userFrom) {
      const notificationModel: INotificationDocument = new NotificationModel();
      const notification = await notificationModel.insertNotification({
        userFrom: userFrom,
        userFromProfilePicture: userFromProfilePicture!,
        userTo: userTo,
        message: `${username} commented on a post you wrote!`,
        notificationType: 'comments',
        entityId: new mongoose.Types.ObjectId(postId),
        createdItemId: new mongoose.Types.ObjectId(response[0]?._id),
        comment: comment.comment,
        reaction: '',
        post: response[1].post,
        imgId: response[1].imgId!,
        imgVersion: response[1].imgVersion!,
        gifUrl: response[1].gifUrl!,
        createdAt: new Date()
      });
    }

    // send to client with SOCKETIO

    // email to user
  }

  public async getCommentsFromDB(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentDocument[]> {
    const comments: ICommentDocument[] = await CommentsModel.aggregate([{ $match: query }, { $sort: sort }]);
    return comments;
  }

  public async getCommentNamesFromDB(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentNameList[]> {
    const commentNamesList: ICommentNameList[] = await CommentsModel.aggregate([
      { $match: query },
      { $sort: sort },
      { $group: { _id: null, names: { $addToSet: '$username' }, count: { $sum: 1 } } },
      { $project: { _id: 0 } }
    ]);

    return commentNamesList;
  }

  public async updateACommentInDB(commentId: string, updatedComment: ICommentDocument): Promise<void> {
    await CommentsModel.updateOne({ _id: commentId }, { $set: updatedComment });
  }

  public async deleteACommentInDB(commentId: string, postId: string): Promise<void> {
    const promisedDeleteComment: Query<IQueryComplete & IQueryDeleted, ICommentDocument> = CommentsModel.deleteOne({ _id: commentId });
    const promisedUpdatedComment: UpdateQuery<IPostDocument> = PostModel.updateOne({ _id: postId }, { $inc: { commentsCount: -1 } });
    await Promise.all([promisedDeleteComment, promisedUpdatedComment]);
  }
}

export const commentService: CommentService = new CommentService();
