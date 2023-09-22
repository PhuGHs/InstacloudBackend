import { UserCache } from '@root/shared/services/redis/user.cache';
import { Request, Response } from 'express';
import { IAuthDocument } from '../interfaces/auth.interface';
import { authService } from '@root/shared/services/db/auth.service';
import { BadRequestError } from '@root/shared/globals/helpers/error-handler';
import { IUserDocument } from '@root/features/users/interfaces/user.interface';
import { userService } from '@root/shared/services/db/user.service';
import jwt from 'jsonwebtoken';
import { config } from '@root/config';
import STATUS_CODE from 'http-status-codes';

export class SignIn {
  public async user(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;
    const existedUser: IAuthDocument = await authService.getAuthUserByUsernameOrEmail(username, '');
    if(!existedUser) {
      throw new BadRequestError('Invalid credentials!');
    }
    const arePasswordsMatch: boolean = await existedUser.comparePassword(password);
    if(!arePasswordsMatch) {
      throw new BadRequestError('Invalid credentials!');
    }
    const user: IUserDocument = await userService.getUserByAuthId(`${existedUser._id}`);
    const userToken: string = jwt.sign({
      userId: user._id,
      uId: existedUser.uId,
      email: existedUser.email,
      username: existedUser.username,
      firstname: existedUser.firstname,
      lastname: existedUser.lastname,
    }, config.JWT_TOKEN!);

    const userDocument: IUserDocument = {
      ...user,
      authId: existedUser._id,
      uId: existedUser.uId,
      email: existedUser.email,
      username: existedUser.username,
      firstname: existedUser.firstname,
      lastname: existedUser.lastname,
      createdAt: existedUser.createdAt,
    } as IUserDocument;

    res.status(STATUS_CODE.OK).json({ message: 'user has been logged in successfully', user: userDocument, jwt: userToken });
  }
}
