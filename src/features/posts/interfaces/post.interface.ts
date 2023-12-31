import { IReactions } from '@reaction/interfaces/reaction.interface';
import { ObjectId } from 'mongodb';
import mongoose, { Document } from 'mongoose';

export interface IPostDocument extends Document {
  _id?: string | mongoose.Types.ObjectId;
  userId: string;
  pId: string;
  username: string;
  email: string;
  profilePicture: string;
  post: string;
  commentsCount: number;
  imgVersion?: string;
  imgId?: string;
  videoId?: string;
  videoVersion?: string;
  feelings?: string;
  gifUrl?: string;
  privacy?: string;
  reactions?: IReactions;
  createdAt?: Date;
}

export interface ISavePostDocument extends Document {
  _id?: string | mongoose.Types.ObjectId;
  userId: string | mongoose.Types.ObjectId;
  postId: string | mongoose.Types.ObjectId;
  username: string;
  createdAt?: Date;
}

export interface ISavePostJob {
  key: ISavePostDocument;
  keyOne?: string;
  keyTwo?: string;
}

export interface IGetPostsQuery {
  _id?: ObjectId | string;
  username?: string;
  imgId?: string;
  videoId?: string;
  gifUrl?: string;
}

export interface ISavePostToCache {
  key: ObjectId | string;
  currentUserId: string;
  uId: string;
  createdPost: IPostDocument;
}

export interface IPostJobData {
  key?: string;
  value?: IPostDocument;
  keyOne?: string;
  keyTwo?: string;
}

export interface IQueryComplete {
  ok?: number;
  n?: number;
}

export interface IQueryDeleted {
  deletedCount?: number;
}
