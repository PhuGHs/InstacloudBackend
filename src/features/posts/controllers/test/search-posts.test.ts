import { authUserPayload } from '@mock/auth.mock';
import { IPostBody, postMockData, postMockRequest, postMockResponse } from '@mock/post.mock';
import { postService } from '@service/db/post.service';
import { Request, Response, query } from 'express';
import { Search } from '../search-posts';

jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/post.cache');

describe('Search Posts', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should send a correct json response', async () => {
    const req: Request = postMockRequest(undefined, authUserPayload, undefined, { query: 'phu' }) as unknown as Request;
    const res: Response = postMockResponse();

    jest.spyOn(postService, 'searchPosts').mockResolvedValue([postMockData]);
    await Search.prototype.posts(req, res);
    expect(postService.searchPosts).toHaveBeenCalledWith(req.query.query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'posts found',
      posts: [postMockData]
    });
  });
});
