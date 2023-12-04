import { authUserPayload } from '@mock/auth.mock';
import { post, postMockData, postMockRequest, postMockResponse } from '@mock/post.mock';
import { postService } from '@service/db/post.service';
import { PostCache } from '@service/redis/post.cache';
import { Request, Response } from 'express';
import { Get } from '../get-posts';

jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/post.cache');

describe('Get Post', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('normal post', () => {
    it('should send correct json response if posts exist in cache', async () => {
      const req: Request = postMockRequest(post, authUserPayload, { page: '1' }) as unknown as Request;
      const res: Response = postMockResponse();
      jest.spyOn(PostCache.prototype, 'getPostsFromCache').mockResolvedValue([postMockData]);
      jest.spyOn(PostCache.prototype, 'getTotalPostsFromCache').mockResolvedValue(1);

      await Get.prototype.posts(req, res);
      expect(PostCache.prototype.getPostsFromCache).toHaveBeenCalledWith('post', 0, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All posts',
        posts: [postMockData],
        totalPosts: 1
      });
    });

    it('should send correct json response if posts exist in database', async () => {
      const req: Request = postMockRequest(post, authUserPayload, { page: '1' }) as unknown as Request;
      const res: Response = postMockResponse();
      jest.spyOn(PostCache.prototype, 'getPostsFromCache').mockResolvedValue([]);
      jest.spyOn(PostCache.prototype, 'getTotalPostsFromCache').mockResolvedValue(0);
      jest.spyOn(postService, 'getPosts').mockResolvedValue([postMockData]);
      jest.spyOn(postService, 'postsCount').mockResolvedValue(1);

      await Get.prototype.posts(req, res);
      expect(postService.getPosts).toHaveBeenCalledWith({}, 0, 10, { createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All posts',
        posts: [postMockData],
        totalPosts: 1
      });
    });

    it('should send empty posts', async () => {
      const req: Request = postMockRequest(post, authUserPayload, { page: '1' }) as unknown as Request;
      const res: Response = postMockResponse();
      jest.spyOn(PostCache.prototype, 'getPostsFromCache').mockResolvedValue([]);
      jest.spyOn(PostCache.prototype, 'getTotalPostsFromCache').mockResolvedValue(0);
      jest.spyOn(postService, 'getPosts').mockResolvedValue([]);
      jest.spyOn(postService, 'postsCount').mockResolvedValue(0);

      await Get.prototype.posts(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All posts',
        posts: [],
        totalPosts: 0
      });
    });
  });

  describe('post with image', () => {
    it('should send correct json response if posts exist in cache', async () => {
      const req: Request = postMockRequest(post, authUserPayload, { page: '1' }) as unknown as Request;
      const res: Response = postMockResponse();
      jest.spyOn(PostCache.prototype, 'getPostsWithImagesFromCache').mockResolvedValue([postMockData]);
      jest.spyOn(PostCache.prototype, 'getTotalPostsWithImagesFromCache').mockResolvedValue(1);

      await Get.prototype.postsWithImage(req, res);
      expect(PostCache.prototype.getPostsWithImagesFromCache).toHaveBeenCalledWith('post', 0, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All posts with images',
        posts: [postMockData],
        totalPosts: 1
      });
    });

    it('should send correct json response if posts exist in database', async () => {
      const req: Request = postMockRequest(post, authUserPayload, { page: '1' }) as unknown as Request;
      const res: Response = postMockResponse();
      jest.spyOn(PostCache.prototype, 'getTotalPostsWithImagesFromCache').mockResolvedValue(0);
      jest.spyOn(PostCache.prototype, 'getPostsWithImagesFromCache').mockResolvedValue([]);
      jest.spyOn(postService, 'getPosts').mockResolvedValue([postMockData]);
      jest.spyOn(postService, 'postsCount').mockResolvedValue(1);

      await Get.prototype.postsWithImage(req, res);
      expect(postService.getPosts).toHaveBeenCalledWith({imgId: '$ne', gifUrl: '$ne'}, 0, 10, { createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All posts with images',
        posts: [postMockData],
        totalPosts: 1
      });
    });

    it('should send empty posts', async () => {
      const req: Request = postMockRequest(post, authUserPayload, { page: '1' }) as unknown as Request;
      const res: Response = postMockResponse();
      jest.spyOn(PostCache.prototype, 'getPostsWithImagesFromCache').mockResolvedValue([]);
      jest.spyOn(PostCache.prototype, 'getTotalPostsWithImagesFromCache').mockResolvedValue(0);
      jest.spyOn(postService, 'getPosts').mockResolvedValue([]);
      jest.spyOn(postService, 'postsCount').mockResolvedValue(0);

      await Get.prototype.postsWithImage(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All posts with images',
        posts: [],
        totalPosts: 0
      });
    });
  });
});
