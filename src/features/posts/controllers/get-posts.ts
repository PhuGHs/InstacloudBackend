import { PostCache } from '@service/redis/post.cache';
import { Request, Response } from 'express';
import { IPostDocument } from '@post/interfaces/post.interface';
import { postService } from '@service/db/post.service';
import STATUS_CODE from 'http-status-codes';

const postCache: PostCache = new PostCache();
const PAGE_SIZE = 10;

export class Get {
  public async posts(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page);
    const newSkip: number = skip === 0 ? skip : skip + 1;
    let posts: IPostDocument[] = [];
    let totalPosts: number = 0;
    const cachedPosts: IPostDocument[] = await postCache.getPostsFromCache('post', newSkip, limit);
    if (cachedPosts.length) {
      posts = cachedPosts;
      totalPosts = await postCache.getTotalPostsFromCache();
    } else {
      posts = await postService.getPosts({}, skip, limit, { createdAt: -1 });
      totalPosts = await postService.postsCount();
    }
    res.status(STATUS_CODE.OK).json({ message: 'All posts', posts, totalPosts });
  }

  public async postsWithImage(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page);
    const newSkip: number = skip === 0 ? skip : skip + 1;
    let posts: IPostDocument[] = [];
    let totalPosts: number = 0;
    const cachedPosts: IPostDocument[] = await postCache.getPostsWithImagesFromCache('post', newSkip, limit);
    if (cachedPosts.length) {
      posts = cachedPosts;
      totalPosts = cachedPosts.length;
    } else {
      posts = await postService.getPosts({ imgId: '$ne', gifUrl: '$ne' }, skip, limit, { createdAt: -1 });
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
    const cachedPosts: IPostDocument[] = await postCache.getPostsWithVideoFromCache('post', newSkip, limit);
    if (cachedPosts.length) {
      posts = cachedPosts;
      totalPosts = posts.length;
    } else {
      posts = await postService.getPosts({ videoId: '$ne' }, skip, limit, { createdAt: -1 });
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
