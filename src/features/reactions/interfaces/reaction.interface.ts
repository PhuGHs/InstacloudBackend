import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export interface IReactionDocument extends Document {
  _id?: string | ObjectId;
  username: string;
  postId: string;
  commentId?: string;
  profilePicture: string;
  createdAt?: Date;
  userTo?: string | ObjectId;
  comment?: string;
}

export interface IReactions {
  like: number;
}

export interface IReactionJob {
  postId?: string;
  commentId?: string;
  username: string;
  userTo?: string;
  userFrom?: string;
  reactionObject?: IReactionDocument;
}

export interface IQueryReaction {
  _id?: string | ObjectId;
  postId?: string | ObjectId;
}

export interface IReaction {
  senderName: string;
  type: string;
}
