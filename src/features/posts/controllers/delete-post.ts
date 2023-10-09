import { postQueue } from '@root/shared/services/queues/post.queue';
import { PostCache } from '@root/shared/services/redis/post.cache';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';

const postCache: PostCache = new PostCache();
export class Delete {
  public async post(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    postCache.deleteAPostInCache(postId, req.currentUser!.userId);
    postQueue.addPostJob('deleteAPostInDB', { keyOne: postId, keyTwo: req.currentUser!.userId });
    res.status(STATUS_CODE.OK).json({ message: 'The post has been deleted successfully!'});
  }
}
