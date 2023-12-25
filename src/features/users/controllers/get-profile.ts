import { IFollower, IFollowerData } from '@follower/interfaces/follower.interface';
import { SupportiveMethods } from '@global/helpers/supportive-methods';
import { IFileImageDocument } from '@image/interfaces/image.interface';
import { IPostDocument, ISavePostDocument } from '@post/interfaces/post.interface';
import { followerService } from '@service/db/follower.service';
import { imageService } from '@service/db/image.service';
import { postService } from '@service/db/post.service';
import { userService } from '@service/db/user.service';
import { FollowerCache } from '@service/redis/follower.cache';
import { PostCache } from '@service/redis/post.cache';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';
import mongoose from 'mongoose';

const SIZE = 12;

export interface IGetAllUser {
  skip: number;
  limit: number;
  newSkip: number;
  userId: string;
}

const userCache: UserCache = new UserCache();
const postCache: PostCache = new PostCache();
const followerCache: FollowerCache = new FollowerCache();

export class Get {
  public async profile(req: Request, res: Response): Promise<void> {
    const cachedUser: IUserDocument = (await userCache.getUserFromCache(req.currentUser!.userId)) as IUserDocument;
    const user: IUserDocument = cachedUser ? cachedUser : await userService.getUserById(req.currentUser!.userId);
    res.status(STATUS_CODE.OK).json({ message: 'current user profile', user });
  }

  public async profileByUserId(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const cachedUser: IUserDocument = (await userCache.getUserFromCache(userId)) as IUserDocument;
    const user: IUserDocument = cachedUser ? cachedUser : await userService.getUserById(userId);
    res.status(STATUS_CODE.OK).json({ message: `user with id: ${userId} profile`, user });
  }

  public async profileMaterials(req: Request, res: Response): Promise<void> {
    const { userId, username, uId } = req.params;
    const userName: string = SupportiveMethods.lowercase(username) as string;

    const cachedUser: IUserDocument | null = await userCache.getUserFromCache(userId);
    const user: IUserDocument = cachedUser ? cachedUser : await userService.getUserById(userId);

    if (user.blockedBy.toString().includes(req.currentUser!.userId) || user.blocked.toString().includes(req.currentUser!.userId)) {
      res.status(STATUS_CODE.NOT_FOUND).json({ message: 'user not found or you blocked this user' });
      return;
    }
    const cachedPosts: IPostDocument[] = await postCache.getPostsFromCacheOfAUser('post', parseInt(uId, 10));
    const userIds: mongoose.Types.ObjectId[] = [];
    for (const blockedUser of [...user.blocked, ...user.blockedBy]) {
      userIds.push(new mongoose.Types.ObjectId(blockedUser));
    }
    const posts: IPostDocument[] = cachedPosts.length
      ? cachedPosts
      : await postService.getPosts({ username: userName }, userIds, 0, 100, { createdAt: -1 });

    const followers: IFollowerData[] = await Get.prototype.followers(userId);
    const following: IFollowerData[] = await Get.prototype.following(userId);

    const imagePostsFromCache: IPostDocument[] = await postCache.getPostsWithImagesOfAUserFromCache('post', parseInt(uId, 10));
    const imagePosts: IPostDocument[] = imagePostsFromCache.length
      ? imagePostsFromCache
      : await postService.getPostWithImageOfAUser(userId);
    if (userId === req.currentUser!.userId) {
      const savedPosts: ISavePostDocument[] = await postService.getSavedPostsFromDB(userId);
      res.status(STATUS_CODE.OK).json({ message: 'user materials: ', user, posts, followers, following, image: imagePosts, savedPosts });
    } else {
      res.status(STATUS_CODE.OK).json({ message: 'user materials: ', user, posts, followers, following, image: imagePosts });
    }
  }

  private async followers(userId: string): Promise<IFollowerData[]> {
    // const cachedFollowers: IFollowerData[] = await followerCache.getFollowerFromCache(`followers:${userId}`);
    const followers: IFollowerData[] = await followerService.getFollowers(new mongoose.Types.ObjectId(userId));
    return followers;
  }

  private async following(userId: string): Promise<IFollowerData[]> {
    // const cachedFollowerList: IFollowerData[] = await followerCache.getFollowerFromCache(`following:${userId}`);
    const followingList: IFollowerData[] = await followerService.getFollowingList(new mongoose.Types.ObjectId(userId));
    return followingList;
  }
}
