import { Request, Response } from 'express';
import { BadRequestError } from '@root/shared/globals/helpers/error-handler';
import HTTP_STATUS from 'http-status-codes';

export class SignUp {
  public async user(req: Request, res: Response): Promise<void> {
    const { username, email, password, avatarImage } = req.body;
    //check if user is exist

    //if no throw bad request error(invalid credentials)
    //if yes, up avatar to cloudinary and save data to db and redis
    res.status(HTTP_STATUS.OK).json({message: 'account is created successfully!'});
  }
}
