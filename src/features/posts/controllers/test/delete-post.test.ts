import { Request, Response } from 'express';
import { Server } from 'socket.io';
import * as postServer from '@socket/post.socket';
import { IPostBody, postMockRequest, postMockResponse } from '@mock/post.mock';
import { authUserPayload } from '@mock/auth.mock';
import { Delete } from '../delete-post';
import { PostCache } from '@service/redis/post.cache';
import { postQueue } from '@service/queues/post.queue';

jest.mock('@service/queues/base.queue');
jest.mock('@service/queues/post.queue');
jest.mock('@service/redis/post.cache');

Object.defineProperties(postServer, {
  socketIOPostObject: {
    value: new Server(),
    writable: true
  }
});

const postId: string = '6568049ff9ecc21f63864821';

describe('Delete Post', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should send a correct json response', async () => {
    const req: Request = postMockRequest(undefined, authUserPayload, { postId }) as unknown as Request;
    const res: Response = postMockResponse();

    jest.spyOn(postServer.socketIOPostObject, 'emit');
    jest.spyOn(PostCache.prototype, 'deleteAPostInCache');
    jest.spyOn(postQueue, 'addPostJob');

    await Delete.prototype.post(req, res);
    expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('delete post', postId);
    expect(PostCache.prototype.deleteAPostInCache).toHaveBeenCalledWith(postId, req.currentUser!.userId);
    expect(postQueue.addPostJob).toHaveBeenCalledWith('deleteAPostInDB', { keyOne: postId, keyTwo: req.currentUser!.userId});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'The post has been deleted successfully!'
    });
  });
});
