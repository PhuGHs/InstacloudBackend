import { ISavePostDocument } from '@post/interfaces/post.interface';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import STATUS_CODE from 'http-status-codes';
import { postQueue } from '@service/queues/post.queue';

export class Save {
  public async post(req: Request, res: Response): Promise<void> {
    const { postId } = req.body;
    //save to DB
    const data: ISavePostDocument = {
      userId: new mongoose.Types.ObjectId(req.currentUser!.userId),
      postId: new mongoose.Types.ObjectId(postId),
      username: req.currentUser!.username,
      createdAt: new Date(),
    } as ISavePostDocument;
    postQueue.addPostJob('saveOtherPostsToDB', { key: data });
    res.status(STATUS_CODE.OK).json({ message: 'The post has been saved'});
  }
}
