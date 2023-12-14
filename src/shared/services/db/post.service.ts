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

  public async getSinglePost(postId: string): Promise<IPostDocument> {
    const post: IPostDocument = await PostModel.findOne({ _id: postId }).exec() as IPostDocument;
    return post;
  }

  public async postsCount(): Promise<number> {
    return await PostModel.find({}).countDocuments();
  }

  public async saveOtherPostsToDB(post: ISavePostDocument): Promise<void> {
    await SavedPostModel.create(post);
  }

  public async removeSavedPostFromDB(postId: string, userId: string): Promise<void> {
    await SavedPostModel.deleteOne({ userId: userId, postId: postId }).exec();
  }

  public async checkIfPostExisted(postId: string, userId: string): Promise<boolean> {
    const number: number = await SavedPostModel.countDocuments({ postId: postId, userId: userId});
    if(number != 0) return true;
    return false;
  }

  public async getSavedPostsFromDB(userId: string): Promise<ISavePostDocument[]> {
    const savedPosts: ISavePostDocument[] = await SavedPostModel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $lookup: { from: 'Post', localField: 'postId', foreignField: '_id', as: 'post' }},
      { $unwind: '$post' },
      { $project: this.aggregateProject()},
      {
        $sort: { createdAt: -1 }
      }
    ]);
    return savedPosts;
  }

  private aggregateProject() {
    return {
      _id: 1,
      userId: 1,
      postId: '$post._id',
      username: 1,
      createdAt: 1,
      authorId: '$post.userId',
      authorEmail: '$post.email',
      pId: '$post.pId',
      authorName: '$post.username',
      authorProfilePicture: '$post.profilePicture',
      post: '$post.post',
      commentsCount: '$post.commentsCount',
      imgVersion: '$post.imgVersion',
      imgId: '$post.imgId',
      videoId: '$post.videoId',
      videoVersion: '$post.videoVersion',
      gifUrl: '$post.gifUrl',
      privacy: '$post.privacy',
      reactions: '$post.reactions',
      postCreatedDate: '$post.createdAt',
    };
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
