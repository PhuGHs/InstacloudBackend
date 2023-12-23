import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export interface IReactionDocument extends Document {
  _id?: string | ObjectId;
  username: string;
  userId: string;
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
  userFromProfilePicture?: string;
  reactionObject?: IReactionDocument;
}

export interface IQueryReaction {
  _id?: string | ObjectId;
  postId?: string | ObjectId;
  commentId?: string | ObjectId;
  username?: string;
  userId?: string;
}

export interface IReaction {
  senderName: string;
  type: string;
}
