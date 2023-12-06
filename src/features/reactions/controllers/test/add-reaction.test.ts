import { authUserPayload } from '@mock/auth.mock';
import { commentReaction, reaction, reactionMockRequest, reactionMockResponse } from '@mock/reaction.mock';
import { reactionQueue } from '@service/queues/reaction.queue';
import { ReactionCache } from '@service/redis/reaction.cache';
import { Request, Response } from 'express';
import { Add } from '../add-reactions';
import { postQueue } from '@service/queues/post.queue';

jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/reaction.cache');
jest.mock('@service/queues/reaction.queue');

// // jest.mock('@notification/models/notification.schema');
// // jest.mock('@service/db/reaction.service.ts');
// // jest.mock('@worker/reaction.worker.ts');

describe('Add Reaction', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('post reaction', () => {
    it('should send a correct json response', async () => {
      const req: Request = reactionMockRequest({}, reaction, authUserPayload) as Request;
      const res: Response = reactionMockResponse();

      const spiedMethod = jest.spyOn(ReactionCache.prototype, 'addPostReactionToCache');
      const spiedQueue = jest.spyOn(reactionQueue, 'addReactionJob');

      await Add.prototype.reaction(req, res);
      const [postId, reactionDocument, postReactions] = spiedMethod.mock.calls[0];
      const [name, reactionJob] = spiedQueue.mock.calls[0];
      expect(ReactionCache.prototype.addPostReactionToCache).toHaveBeenCalledWith(
        postId, reactionDocument, postReactions
      );
      expect(spiedQueue).toHaveBeenCalledWith(name, reactionJob);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Your post reaction has been added.'
      });
    });
  });

  describe('comment reaction', () => {
    it('should send a correct json response', async () => {
      const req: Request = reactionMockRequest({}, commentReaction, authUserPayload) as Request;
      const res: Response = reactionMockResponse();

      const spiedMethod = jest.spyOn(ReactionCache.prototype, 'addCommentReactionToCache');
      const spiedQueue = jest.spyOn(reactionQueue, 'addReactionJob');

      await Add.prototype.commentReaction(req, res);
      const [commentId, reactionDocument, postReactions] = spiedMethod.mock.calls[0];
      const [name, reactionJob] = spiedQueue.mock.calls[0];
      expect(ReactionCache.prototype.addCommentReactionToCache).toHaveBeenCalledWith(
        commentId,
        reactionDocument,
        postReactions
      );
      expect(spiedQueue).toHaveBeenCalledWith(name, reactionJob);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Your comment reaction has been added.'
      });
    });
  });
});
