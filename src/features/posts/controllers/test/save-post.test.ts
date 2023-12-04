import { authUserPayload } from '@mock/auth.mock';
import { IPostBody, postMockRequest, postMockResponse, savedPost } from '@mock/post.mock';
import { Request, Response } from 'express';
import { Save } from '../save-post';
import { postQueue } from '@service/queues/post.queue';

jest.mock('@service/queues/base.queue');
jest.mock('@service/queues/post.queue');

describe('Save Post', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should send a correct json response', async () => {
    const req: Request = postMockRequest({ postId: '6568049ff9ecc21f63864821' } as IPostBody, authUserPayload) as unknown as Request;
    const res: Response = postMockResponse();

    await Save.prototype.post(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'The post has been saved'
    });
  });
});
