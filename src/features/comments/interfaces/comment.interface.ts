import { IReactions } from '@reaction/interfaces/reaction.interface';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export interface ICommentDocument extends Document {
  _id?: string | ObjectId;
  username: string;
  userId: string;
  postId: string;
  profilePicture: string;
  comment: string;
  createdAt?: Date;
  reactions?: IReactions;
  userTo?: string | ObjectId;
}

export interface ICommentJob {
  postId: string;
  userTo: string;
  userFrom: string;
  userFromProfilePicture: string;
  username: string;
  comment: ICommentDocument;
}

export interface IUpdateCommentJob {
  key?: string;
  value?: ICommentDocument;
  keyOne?: string;
  keyTwo?: string;
}

export interface ICommentNameList {
  count: number;
  names: string[];
}

export interface IQueryComment {
  _id?: string | ObjectId;
  postId?: string | ObjectId;
  userId?: unknown;
}

export interface IQuerySort {
  createdAt?: number;
}

export interface ISaveCommentToCache {
  commentId: string;
  commentData: ICommentDocument;
}
