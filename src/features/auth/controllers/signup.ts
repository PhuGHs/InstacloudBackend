import { Request, Response } from 'express';
import { BadRequestError } from '@root/shared/globals/helpers/error-handler';
import HTTP_STATUS from 'http-status-codes';
import { IAuthDocument, ISignUpData } from '../interfaces/auth.interface';
import { authService } from '@root/shared/services/db/auth.service';
import { ObjectId } from 'mongodb';
import { SupportiveMethods } from '@root/shared/globals/helpers/supportive-methods';

export class SignUp {
  public async user(req: Request, res: Response): Promise<void> {
    const { username, firstname, lastname, email, password, avatarImage } = req.body;
    //check if user is exist
    const existedUser: IAuthDocument = await authService.getAuthUserByUsernameOrEmail(username, email);
    if(existedUser) {
      throw new BadRequestError('invalid credentials!');
    }
    //if no throw bad request error(invalid credentials)
    //if yes, up avatar to cloudinary and save data to db and redis
    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    res.status(HTTP_STATUS.OK).json({message: 'account is created successfully!'});
  }

  private formSignUpData(data: ISignUpData): IAuthDocument {
    const {_id, uId, username, firstname, lastname, email, password } = data;
    return {
      _id,
      uId,
      username: SupportiveMethods.uppercaseFirstLetter(username),
      firstname,
      lastname,
      email: SupportiveMethods.lowercase(email),
      password,
      createdAt: new Date()
    } as IAuthDocument;
  }
}
