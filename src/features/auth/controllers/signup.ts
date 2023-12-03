import { Request, Response } from 'express';
import { BadRequestError } from '@root/shared/globals/helpers/error-handler';
import HTTP_STATUS from 'http-status-codes';
import { IAuthDocument, ISignUpData } from '../interfaces/auth.interface';
import { authService } from '@root/shared/services/db/auth.service';
import { ObjectId } from 'mongodb';
import { SupportiveMethods } from '@root/shared/globals/helpers/supportive-methods';
import { UploadApiResponse } from 'cloudinary';
import { upload } from '@global/helpers/cloudinary-upload';
import { IUserDocument } from '@root/features/users/interfaces/user.interface';
import { UserCache } from '@root/shared/services/redis/user.cache';
import { authQueue } from '@root/shared/services/queues/auth.queue';
import { userQueue } from '@root/shared/services/queues/user.queue';
import jwt from 'jsonwebtoken';
import { config } from '@root/config';
import { joiValidation } from '@root/shared/globals/decorators/joi.validation';
import { signupSchema } from '../schemes/auth.signup.scheme';

const userCache: UserCache = new UserCache();
export class SignUp {
  @joiValidation(signupSchema)
  public async user(req: Request, res: Response): Promise<void> {
    const { username, firstname, lastname, email, password, avatarImage } = req.body;
    //check if user is exist
    const existedUser: IAuthDocument = await authService.getAuthUserByUsernameOrEmail(username, email);
    if (existedUser) {
      throw new BadRequestError('invalid credentials!');
    }

    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const uId: string = `${SupportiveMethods.generateRandomIntegers(12)}`;
    const authData: IAuthDocument = await SignUp.prototype.formSignUpData({
      _id: authObjectId,
      uId,
      username,
      email,
      firstname,
      lastname,
      password
    } as ISignUpData);
    const result: UploadApiResponse = (await upload(avatarImage, `${userObjectId}`, true, true)) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequestError('File upload error. Please try again!');
    }
    const userDataForCache: IUserDocument = SignUp.prototype.userData(authData, userObjectId);
    userDataForCache.profilePicture = `https://res.cloudinary.com/daszajz9a/image/upload/v${result.version}/${result.public_id}`;
    await userCache.saveUserToCache(`${userObjectId}`, `${uId}`, userDataForCache);

    authQueue.addAuthUserJob('addAuthUserToDB', { value: authData });
    userQueue.addUserJob('addUserToDB', { value: userDataForCache });
    const token: string = SignUp.prototype.signToken(authData, userObjectId);
    req.session = { jwt: token };
    res.status(HTTP_STATUS.CREATED).json({ message: 'User has been created successfully!', user: userDataForCache, token });
  }

  private formSignUpData(data: ISignUpData): IAuthDocument {
    const { _id, uId, username, firstname, lastname, email, password } = data;
    return {
      _id,
      uId,
      username: SupportiveMethods.uppercaseFirstLetter(username),
      fullname: firstname + ' ' + lastname,
      email: SupportiveMethods.lowercase(email),
      password,
      createdAt: new Date()
    } as IAuthDocument;
  }

  private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
    const { _id, uId, username, email, password, fullname } = data;
    return {
      _id: userObjectId,
      authId: _id,
      uId,
      username: SupportiveMethods.uppercaseFirstLetter(username),
      fullname,
      email: SupportiveMethods.lowercase(email),
      password,
      profilePicture: '',
      blocked: [],
      blockedBy: [],
      work: '',
      location: '',
      school: '',
      quote: '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true
      },
      social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
      }
    } as unknown as IUserDocument;
  }

  private signToken(data: IAuthDocument, userObjectId: ObjectId): string {
    return jwt.sign(
      {
        userId: userObjectId,
        uId: data.uId,
        email: data.email,
        username: data.username,
        fullname: data.fullname
      },
      config.JWT_TOKEN!
    );
  }
}
