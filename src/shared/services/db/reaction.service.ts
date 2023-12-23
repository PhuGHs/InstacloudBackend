import { ICommentDocument } from '@comment/interfaces/comment.interface';
import { CommentsModel } from '@comment/models/comment.schema';
import { INotificationDocument } from '@notification/interfaces/notification.interface';
import { NotificationModel } from '@notification/models/notification.schema';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.schema';
import { IQueryReaction, IReactionDocument, IReactionJob } from '@reaction/interfaces/reaction.interface';
import { ReactionModel } from '@reaction/models/reaction.schema';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import mongoose from 'mongoose';
import { userService } from './user.service';

const userCache: UserCache = new UserCache();

class ReactionService {
  public async addPostReactionToDB(reactionData: IReactionJob): Promise<void> {
    const { postId, username, userTo, userFrom, userFromProfilePicture, reactionObject } = reactionData;
    const reactionDocument: IReactionDocument = reactionObject as IReactionDocument;
    const response: [IUserDocument, IReactionDocument, IPostDocument] = (await Promise.all([
      userService.getUserById(userTo!),
      ReactionModel.replaceOne({ postId, username }, reactionDocument, { upsert: true }),
      PostModel.findOneAndUpdate(
        { _id: postId },
        {
          $inc: {
            ['reactions.like']: 1
          }
        },
        {
          new: true
        }
      )
    ])) as unknown as [IUserDocument, IReactionDocument, IPostDocument];

    //send notification
    if (response[0].notifications.reactions && userTo !== userFrom) {
      const notificationModel: INotificationDocument = new NotificationModel();
      const notification = await notificationModel.insertNotification({
        userFrom: userFrom!,
        userFromProfilePicture: userFromProfilePicture!,
        userTo: userTo!,
        message: `${username} liked your post!`,
        notificationType: 'reactions',
        entityId: new mongoose.Types.ObjectId(postId),
        createdItemId: new mongoose.Types.ObjectId(response[1]?._id),
        comment: '',
        reaction: 'like',
        post: response[2].post,
        imgId: response[2].imgId!,
        imgVersion: response[2].imgVersion!,
        gifUrl: response[2].gifUrl!,
        createdAt: new Date()
      });
    }
    //send to client using socketIO
  }

  public async addCommentReactionToDB(reactionData: IReactionJob): Promise<void> {
    const { commentId, username, userTo, userFrom, userFromProfilePicture, reactionObject } = reactionData;
    const reactionDocument: IReactionDocument = reactionObject as IReactionDocument;
    const response: [IUserDocument, IReactionDocument, ICommentDocument] = (await Promise.all([
      userService.getUserById(userTo!),
      ReactionModel.replaceOne({ commentId, username }, reactionDocument, { upsert: true }),
      CommentsModel.findOneAndUpdate(
        { _id: commentId },
        {
          $inc: {
            ['reactions.like']: 1
          }
        },
        {
          new: true
        }
      )
    ])) as unknown as [IUserDocument, IReactionDocument, ICommentDocument];

    //send notification
    if (response[0].notifications.reactions && userTo !== userFrom) {
      const notificationModel: INotificationDocument = new NotificationModel();
      const notification = await notificationModel.insertNotification({
        userFrom: userFrom!,
        userFromProfilePicture: userFromProfilePicture!,
        userTo: userTo!,
        message: `${username} liked a comment you wrote on a post!`,
        notificationType: 'reactions',
        entityId: new mongoose.Types.ObjectId(commentId),
        createdItemId: new mongoose.Types.ObjectId(response[1]?._id),
        comment: '',
        reaction: 'like',
        post: '',
        imgId: '',
        imgVersion: '',
        gifUrl: '',
        createdAt: new Date()
      });
    }

    //send to client using socketIO
  }

  public async removeReactionFromCache(reactionData: IReactionJob): Promise<void> {
    const { postId, username } = reactionData;
    await Promise.all([
      ReactionModel.deleteOne({ postId, username }),
      PostModel.updateOne({ _id: postId }, { $inc: { ['reactions.like']: -1 } }, { new: true })
    ]);
  }

  public async removeCommentReactionFromCache(reactionData: IReactionJob): Promise<void> {
    const { commentId, username } = reactionData;
    await Promise.all([
      ReactionModel.deleteOne({ commentId, username }),
      CommentsModel.updateOne({ _id: commentId }, { $inc: { ['reactions.like']: -1 } }, { new: true })
    ]);
  }

  public async getPostReactions(query: IQueryReaction, sort: Record<string, 1 | -1>, username?: string): Promise<IReactionDocument[]> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([{ $match: query }, { $sort: sort }]);

    return reactions;
  }


  public async getSingleReaction(query: IQueryReaction, sort: Record<string, 1 | -1>): Promise<IReactionDocument> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([{ $match: query }, { $sort: sort }]);

    return reactions[0];
  }

  // public async getPostReactionByUsername(username: string): Promise<IReactionDocument[]> {
  //   const reactions: IReactionDocument[] = await ReactionModel.aggregate([
  //     { $match: { username: Helpers.firstLetterUppercase(username)}}
  //   ]);

  //   return reactions;
  // }
}

export const reactionService: ReactionService = new ReactionService();
