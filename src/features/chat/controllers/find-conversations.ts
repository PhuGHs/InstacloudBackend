import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';

export class Find {
  public async conversations(req: Request, res: Response): Promise<void> {
    res.status(STATUS_CODE.OK).json({ message: 'results found: '});
  }
}
