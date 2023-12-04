import { IGetPostsQuery, IPostDocument, IQueryComplete, IQueryDeleted, ISavePostDocument } from '@post/interfaces/post.interface';
import { SavedPostModel } from '@post/models/savedPost.schema';
import { PostModel } from '@root/features/posts/models/post.schema';
import { IUserDocument } from '@root/features/users/interfaces/user.interface';
import { UserModel } from '@root/features/users/models/user.schema';
import mongoose, { Query, UpdateQuery } from 'mongoose';

class PostService {
  public async savePostToDB(userId: string, post: IPostDocument): Promise<void> {
    const promisedPost: Promise<IPostDocument> = PostModel.create(post);
    const promisedUser: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: 1 } });
    await Promise.all([promisedPost, promisedUser]);
  }

  public async updateAPost(postId: string, updatedPost: IPostDocument): Promise<void> {
    await PostModel.updateOne({ _id: postId }, { $set: updatedPost });
  }

  public async deleteAPost(postId: string, userId: string): Promise<void> {
    const promiseDeletedPost: Query<IQueryComplete & IQueryDeleted, IPostDocument> = PostModel.deleteOne({ _id: postId });
    //delete reactions
    const promiseUpdatedUser: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: -1 } });
    await Promise.all([promiseDeletedPost, promiseUpdatedUser]);
  }

  public async getPosts(query: IGetPostsQuery, skip = 0, limit = 0, sort: Record<string, 1 | -1>): Promise<IPostDocument[]> {
    let postQuery = {};
    if (query?.imgId && query.gifUrl) {
      postQuery = { $or: [{ imgId: { $ne: '' } }, { gifUrl: { $ne: '' } }] };
    } else if (query?.videoId) {
      postQuery = { $or: [{ videoId: { $ne: '' } }] };
    } else {
      postQuery = query;
    }

    const posts: IPostDocument[] = await PostModel.aggregate([{ $match: postQuery }, { $sort: sort }, { $skip: skip }, { $limit: limit }]);
    return posts;
  }

  public async postsCount(): Promise<number> {
    return await PostModel.find({}).countDocuments();
  }

  public async saveOtherPostsToDB(post: ISavePostDocument): Promise<void> {
    await SavedPostModel.create(post);
  }

  public async getSavedPostsFromDB(userId: string): Promise<ISavePostDocument[]> {
    const savedPosts: ISavePostDocument[] = await SavedPostModel.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);
    return savedPosts;
  }

  public async searchPosts(query: string): Promise<IPostDocument[]> {
    const posts: IPostDocument[] = await PostModel.aggregate([
      { $search: {
        index: 'post_search',
        autocomplete: {
          query,
          path: 'post',
          tokenOrder: 'sequential'
        }
      }}
    ]);
    return posts;
  }
}

export const postService: PostService = new PostService();
