import { ISavePostDocument } from '@post/interfaces/post.interface';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import STATUS_CODE from 'http-status-codes';
import { postQueue } from '@service/queues/post.queue';
import { postService } from '@service/db/post.service';

export class Save {
  public async post(req: Request, res: Response): Promise<void> {
    const { postId } = req.body;
    const isExisted: boolean = await postService.checkIfPostExisted(postId, req.currentUser!.userId);
    console.log(isExisted);
    if(isExisted) {
      postQueue.addPostJob('removeASavedPostFromDB', {
        keyOne: postId,
        keyTwo: req.currentUser!.userId
      });
      res.status(STATUS_CODE.OK).json({ message: 'Post has been removed from saved collections'});
    } else {
      const data: ISavePostDocument = {
        userId: new mongoose.Types.ObjectId(req.currentUser!.userId),
        postId: new mongoose.Types.ObjectId(postId),
        username: req.currentUser!.username,
        createdAt: new Date()
      } as ISavePostDocument;

      postQueue.addPostJob('saveOtherPostsToDB', { key: data });
      res.status(STATUS_CODE.OK).json({ message: 'The post has been saved' });
    }
  }
}
