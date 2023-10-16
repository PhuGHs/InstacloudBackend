import { ICommentDocument } from '@comment/interfaces/comment.interface';
import { CommentsModel } from '@comment/models/comment.schema';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.schema';
import { IReactionDocument, IReactionJob } from '@reaction/interfaces/reaction.interface';
import { ReactionModel } from '@reaction/models/reaction.schema';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';

const userCache: UserCache = new UserCache();

class ReactionService {
    public async addPostReactionToDB(reactionData: IReactionJob): Promise<void> {
      const { postId, username, userTo, userFrom, reactionObject } = reactionData;
      const reactionDocument: IReactionDocument = reactionObject as IReactionDocument;
      const response: [IUserDocument, IReactionDocument, IPostDocument] =  await Promise.all([
        userCache.getUserFromCache(`${userTo}`),
          ReactionModel.replaceOne({ postId, username }, reactionDocument, { upsert: true }),
          PostModel.findOneAndUpdate(
            { _id: postId }, {
              $inc: {
                ['reactions.like']: 1
              }
            },
            {
              new: true
            }
          )
      ]) as unknown as [IUserDocument, IReactionDocument, IPostDocument];
    }

    public async addCommentReactionToDB(reactionData: IReactionJob): Promise<void> {
      const { commentId, username, userTo, userFrom, reactionObject } = reactionData;
      const reactionDocument: IReactionDocument = reactionObject as IReactionDocument;
      const response: [IUserDocument, IReactionDocument, ICommentDocument] =  await Promise.all([
        userCache.getUserFromCache(`${userTo}`),
          ReactionModel.replaceOne({ commentId, username }, reactionDocument, { upsert: true }),
          CommentsModel.findOneAndUpdate(
            { _id: commentId }, {
              $inc: {
                ['reactions.like']: 1
              }
            },
            {
              new: true
            }
          )
      ]) as unknown as [IUserDocument, IReactionDocument, ICommentDocument];
    }
}

export const reactionService: ReactionService = new ReactionService();
