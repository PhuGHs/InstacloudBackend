import { IPostDocument, IQueryComplete, IQueryDeleted } from '@post/interfaces/post.interface';
import { PostModel } from '@root/features/posts/models/post.schema';
import { IUserDocument } from '@root/features/users/interfaces/user.interface';
import { UserModel } from '@root/features/users/models/user.schema';
import { Query, UpdateQuery } from 'mongoose';

class PostService {
  public async savePostToDB(userId: string, post: IPostDocument): Promise<void> {
    const promisedPost: Promise<IPostDocument> = PostModel.create(post);
    const promisedUser: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: 1}});
    await Promise.all([promisedPost, promisedUser]);
  }

  public async updateAPost(postId: string, updatedPost: IPostDocument): Promise<void> {
    await PostModel.updateOne({_id: postId}, { $set: updatedPost });
  }

  public async deleteAPost(postId: string, userId: string): Promise<void> {
    const promiseDeletedPost: Query<IQueryComplete & IQueryDeleted, IPostDocument> = PostModel.deleteOne({ _id: postId });
    //delete reactions
    const promiseUpdatedUser: UpdateQuery<IUserDocument> = UserModel.updateOne({_id: userId }, {$inc: { postsCount: -1 }});
    await Promise.all([promiseDeletedPost, promiseUpdatedUser]);
  }
}

export const postService: PostService = new PostService();
