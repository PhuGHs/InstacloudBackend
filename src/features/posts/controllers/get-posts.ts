import { PostCache } from '@service/redis/post.cache';
import { Request, Response } from 'express';
import { IPostDocument } from '@post/interfaces/post.interface';
import { postService } from '@service/db/post.service';
import STATUS_CODE from 'http-status-codes';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserCache } from '@service/redis/user.cache';
import { userService } from '@service/db/user.service';
import mongoose from 'mongoose';

const postCache: PostCache = new PostCache();
const userCache: UserCache = new UserCache();
const PAGE_SIZE = 10;

export class Get {
  public async posts(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page);
    const newSkip: number = skip === 0 ? skip : skip + 1;
    let posts: IPostDocument[] = [];
    let totalPosts: number = 0;
    const cachedUser: IUserDocument = await userCache.getUserFromCache(req.currentUser!.userId) as IUserDocument;
    const user: IUserDocument = cachedUser ? cachedUser : await userService.getUserById(req.currentUser!.userId) as IUserDocument;
    const cachedPosts: IPostDocument[] = await postCache.getPostsFromCache('post', newSkip, limit, user);
    console.log(user.blocked);
    const userIds: mongoose.Types.ObjectId[] = [];
    for(const blockedUser of [...user.blocked, ...user.blockedBy]) {
      userIds.push(new mongoose.Types.ObjectId(blockedUser));
    }
    if (cachedPosts.length) {
      posts = cachedPosts;
      totalPosts = await postCache.getTotalPostsFromCache();
    } else {
      posts = await postService.getPosts({}, userIds, skip, limit, { createdAt: -1 });
      totalPosts = await postService.postsCount();
    }
    res.status(STATUS_CODE.OK).json({ message: 'All posts', posts, totalPosts });
  }

  public async postsWithImage(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page);
    const newSkip: number = skip === 0 ? skip : skip + 1;
    const cachedUser: IUserDocument = await userCache.getUserFromCache(req.currentUser!.userId) as IUserDocument;
    const user: IUserDocument = cachedUser ? cachedUser : await userService.getUserById(req.currentUser!.userId) as IUserDocument;
    let posts: IPostDocument[] = [];
    let totalPosts: number = 0;
    const userIds: mongoose.Types.ObjectId[] = [];
    for(const blockedUser of [...user.blocked, ...user.blockedBy]) {
      userIds.push(new mongoose.Types.ObjectId(blockedUser));
    }
    const cachedPosts: IPostDocument[] = await postCache.getPostsWithImagesFromCache('post', newSkip, limit, user);
    posts = cachedPosts;
    totalPosts = cachedPosts.length;
    if (cachedPosts.length) {
      posts = cachedPosts;
      totalPosts = cachedPosts.length;
    } else {
      posts = await postService.getPosts({ imgId: '$ne', gifUrl: '$ne' }, userIds, skip, limit, { createdAt: -1 });
      totalPosts = posts.length;
    }
    res.status(STATUS_CODE.OK).json({ message: 'All posts with images', posts, totalPosts });
  }

  public async postsWithVideo(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page);
    const newSkip: number = skip === 0 ? skip : skip + 1;
    let posts: IPostDocument[] = [];
    let totalPosts: number = 0;
    const cachedUser: IUserDocument = await userCache.getUserFromCache(req.currentUser!.userId) as IUserDocument;
    const user: IUserDocument = cachedUser ? cachedUser : await userService.getUserById(req.currentUser!.userId) as IUserDocument;
    const userIds: mongoose.Types.ObjectId[] = [];
    for(const blockedUser of [...user.blocked, ...user.blockedBy]) {
      userIds.push(new mongoose.Types.ObjectId(blockedUser));
    }
    const cachedPosts: IPostDocument[] = await postCache.getPostsWithVideoFromCache('post', newSkip, limit, user);
    if (cachedPosts.length) {
      posts = cachedPosts;
      totalPosts = posts.length;
    } else {
      posts = await postService.getPosts({ videoId: '$ne' }, userIds, skip, limit, { createdAt: -1 });
      totalPosts = posts.length;
    }
    res.status(STATUS_CODE.OK).json({ message: 'All posts with video', posts, totalPosts });
  }

  public async getSinglePost(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const posts: IPostDocument[] = await postCache.getAPostFromCache(postId);
    const result = posts.length > 0 ? posts[0] : await postService.getSinglePost(postId);
    if(!result) {
      res.status(STATUS_CODE.NOT_FOUND).json({ message: 'Post had been deleted or not existed!'});
    } else {
      res.status(STATUS_CODE.OK).json({ post: result });
    }
  }
}
