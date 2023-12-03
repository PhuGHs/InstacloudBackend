import { userService } from '@service/db/user.service';
import { IBackgroundInfo, IUserDocument } from '@user/interfaces/user.interface';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import STATUS_CODES from 'http-status-codes';

export class Search {
  public async users(req: Request, res: Response): Promise<void> {
    const query = req.query.q as string;
    const location: string = req.query.location as string;

    const users: IUserDocument[] = await userService.searchUsers(query, new mongoose.Types.ObjectId(req.currentUser!.userId), location);
    //filter bao gom location, work, school => la 1 object
    res.status(STATUS_CODES.OK).json({ message: 'users found', users });
  }
}
