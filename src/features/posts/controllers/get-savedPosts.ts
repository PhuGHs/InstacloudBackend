import { ISavePostDocument } from '@post/interfaces/post.interface';
import { postService } from '@service/db/post.service';
import { Request, Response } from 'express';
import STATUS_CODES from 'http-status-codes';

export class GetSavedPost {
  public async posts(req: Request, res: Response): Promise<void> {
    const posts: ISavePostDocument[] = await postService.getSavedPostsFromDB(req.currentUser!.userId);
    res.status(STATUS_CODES.OK).json({ message: 'posts saved by current user', posts });
  }

  public async checkIfExisted(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const existed: boolean = await postService.checkIfPostExisted(postId, req.currentUser!.userId);
    res.status(STATUS_CODES.OK).json({ isExisted: existed });
  }
}
