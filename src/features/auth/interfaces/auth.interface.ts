import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';
import { IUserDocument } from '@user/interfaces/user.interface';

declare global {
  namespace Express {
    interface Request {
      currentUser?: AuthPayload;
    }
  }
}

export interface AuthPayload {
  userId: string,
  uId: string,
  email: string,
  username: string,
  firstname: string,
  lastname: string,
  iat?: number
}

export interface IAuthDocument extends Document {
  _id: string | ObjectId;
  uId: number;
  username: string;
  email: string;
  password?: string;
  firstname: string;
  lastname: string;
  createdAt: Date;
  passwordResetToken?: string;
  passwordResetExpires: number | string;
  comparePassword(password: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}

export interface ISignUpData {
  _id: ObjectId;
  uId: number;
  email: string;
  username: string;
  password: string;
  firstname: string;
  lastname: string;
}

export interface IAuthJob {
  value?: string | IAuthDocument | IUserDocument;
}
