import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

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
  iat?: number
}

export interface IAuthDocument extends Document {
  _id: string | ObjectId;
  uId: string;
  username: string;
  email: string;
  password?: string;
  createdAt: Date;
  passwordResetToken?: string;
  passwordResetExpires: number | string;
  comparePassword(password: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}

export interface ISignUpData {
  _id: ObjectId;
  uId: string;
  email: string;
  username: string;
  password: string;
}
