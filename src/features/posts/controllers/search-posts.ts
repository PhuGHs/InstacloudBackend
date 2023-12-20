import { IPostDocument } from '@post/interfaces/post.interface';
import { postService } from '@service/db/post.service';
import { Request, Response } from 'express';
import STATUS_CODES from 'http-status-codes';

export class Search {
  public async posts(req: Request, res: Response): Promise<void> {
    const query: string = req.query.query as string;
    const date_before: Date = new Date(req.query.date as string);
    const posts: IPostDocument[] = await postService.searchPosts(query, date_before);
    res.status(STATUS_CODES.OK).json({ message: 'posts found', posts});
  }
}
