import { Request, Response } from 'express';
import HTTP_CODE from 'http-status-codes';

export class SignOut {
  public async user(req: Request, res: Response): Promise<void> {
    req.session = null;
    res.status(HTTP_CODE.OK).json({ message: 'Log out successfully!', user: {}, token: {} });
  }
}
