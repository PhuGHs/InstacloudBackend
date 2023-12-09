import { postQueue } from '@root/shared/services/queues/post.queue';
import { PostCache } from '@root/shared/services/redis/post.cache';
import { socketIOPostObject } from '@socket/post.socket';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';

const postCache: PostCache = new PostCache();
export class Delete {
  public async post(req: Request, res: Response): Promise<void> {
    const { postId, pId } = req.params;
    socketIOPostObject.emit('delete post', postId);
    postCache.deleteAPostInCache(postId, req.currentUser!.userId, pId);
    postQueue.addPostJob('deleteAPostInDB', { keyOne: postId, keyTwo: req.currentUser!.userId });
    res.status(STATUS_CODE.OK).json({ message: 'The post has been deleted successfully!' });
  }
}
