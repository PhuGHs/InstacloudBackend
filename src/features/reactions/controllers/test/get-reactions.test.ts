import { authUserPayload } from '@mock/auth.mock';
import { commentReaction, postReactionData, reactionMockRequest, reactionMockResponse } from '@mock/reaction.mock';
import { reactionService } from '@service/db/reaction.service';
import { ReactionCache } from '@service/redis/reaction.cache';
import { Request, Response } from 'express';
import { Get } from '../get-reactions';
import mongoose from 'mongoose';

jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/reaction.cache');
jest.mock('@service/db/reaction.service');

describe('Get Reactions', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('post', () => {
    it('should send a correct json response if reactions exist in cache',  async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, { postId: commentReaction.postId }) as Request;
      const res: Response = reactionMockResponse();

      const reactionCacheSpied = jest.spyOn(ReactionCache.prototype, 'getPostReaction').mockResolvedValue([[postReactionData], 1]);
      const reactionServiceSpied = jest.spyOn(reactionService, 'getPostReactions').mockResolvedValue([[], 0]);
      await Get.prototype.postReactions(req, res);
      const [postId, username] = reactionCacheSpied.mock.calls[0];
      expect(reactionCacheSpied).toHaveBeenCalledWith(postId, username);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'post reactions',
        reactions: [[postReactionData], 1]
      });
    });

    it('should send a correct json response if reactions exist in db',  async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, { commentId: commentReaction.commentId }) as Request;
      const res: Response = reactionMockResponse();

      const reactionCacheSpied = jest.spyOn(ReactionCache.prototype, 'getPostReaction').mockResolvedValue([[], 0]);
      const reactionServiceSpied = jest.spyOn(reactionService, 'getPostReactions').mockResolvedValue([[postReactionData], 1]);
      await Get.prototype.postReactions(req, res);
      expect(reactionServiceSpied).toHaveBeenCalledWith(
        reactionServiceSpied.mock.calls[0][0],
        reactionServiceSpied.mock.calls[0][1],
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'post reactions',
        reactions: [[postReactionData], 1]
      });
    });
  });

  // describe('comment', () => {
  //   it('should send a correct json response if comment reactions exist in cache',  async () => {
  //     const req: Request = reactionMockRequest({}, {}, authUserPayload, { commentId: commentReaction.commentId }) as Request;
  //     const res: Response = reactionMockResponse();

  //     const reactionCacheSpied = jest.spyOn(ReactionCache.prototype, 'getPostReaction').mockResolvedValue([[postReactionData], 1]);
  //     const reactionServiceSpied = jest.spyOn(reactionService, 'getPostReactions').mockResolvedValue([[], 0]);
  //     await Get.prototype.postReactions(req, res);
  //     const [postId, username] = reactionCacheSpied.mock.calls[0];
  //     expect(reactionCacheSpied).toHaveBeenCalledWith(postId, username);
  //     expect(res.status).toHaveBeenCalledWith(200);
  //     expect(res.json).toHaveBeenCalledWith({
  //       message: 'post reactions',
  //       reactions: [[postReactionData], 1]
  //     });
  //   });

  //   it('should send a correct json response if comment reactions exist in db',  async () => {
  //     const req: Request = reactionMockRequest({}, {}, authUserPayload, { commentId: commentReaction.commentId }) as Request;
  //     const res: Response = reactionMockResponse();

  //     const reactionCacheSpied = jest.spyOn(ReactionCache.prototype, 'getPostReaction').mockResolvedValue([[], 0]);
  //     const reactionServiceSpied = jest.spyOn(reactionService, 'getPostReactions').mockResolvedValue([[postReactionData], 1]);
  //     await Get.prototype.postReactions(req, res);
  //     expect(reactionServiceSpied).toHaveBeenCalledWith(
  //       reactionServiceSpied.mock.calls[0][0],
  //       reactionServiceSpied.mock.calls[0][1],
  //     );
  //     expect(res.status).toHaveBeenCalledWith(200);
  //     expect(res.json).toHaveBeenCalledWith({
  //       message: 'post reactions',
  //       reactions: [[postReactionData], 1]
  //     });
  //   });
  // });
});
