import { Request, Response } from 'express';
import { IJWT } from './auth.mock';
import { IReactionDocument, IReactions } from '@reaction/interfaces/reaction.interface';
import { AuthPayload } from '@auth/interfaces/auth.interface';
import { IParameters } from './post.mock';

export const reactionMockRequest = (sessionData: IJWT, body: IBody, currentUser?: AuthPayload | null, params?: IParameters) => ({
  session: sessionData,
  body,
  params,
  currentUser
});

export const reactionMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

export interface IBody {
  postId?: string;
  commentId?: string;
  profilePicture?: string;
  userTo?: string;
  postReactions?: IReactions;
}

export const postReactionData: IReactionDocument = {
  _id: '656de447dda93886cb4b7039',
  username: 'phule',
  postId: '6568049ff9ecc21f63864821',
  profilePicture: 'https://res.cloudinary.com/daszajz9a/image/upload/v1701313830/6567fd25ec30e86a7dc57d1c',
  createdAt: '2023-12-04T14:37:59.986Z',
  userTo: '6567fd23ec30e86a7dc57d1a',
  liked: true
} as unknown as IReactionDocument;

export const commentReactionData: IReactionDocument = {
  _id: '656de447dda93886cb4b7039',
  username: 'phule',
  postId: '6568049ff9ecc21f63864821',
  profilePicture: 'https://res.cloudinary.com/daszajz9a/image/upload/v1701313830/6567fd25ec30e86a7dc57d1c',
  createdAt: '2023-12-04T14:37:59.986Z',
  userTo: '6567fd23ec30e86a7dc57d1a',
  liked: true
} as unknown as IReactionDocument;

export const reaction: IBody = {
  postId: '6568049ff9ecc21f63864821',
  userTo: '6567fd23ec30e86a7dc57d1a',
  postReactions: {
    like: 1
  },
  profilePicture: 'https://res.cloudinary.com/daszajz9a/image/upload/v1701313830/6567fd25ec30e86a7dc57d1c'
};

export const commentReaction: IBody = {
  commentId: '656de496dda93886cb4b703a',
  userTo: '6567fd23ec30e86a7dc57d1a',
  postReactions: {
    like: 1
  },
  profilePicture: 'https://res.cloudinary.com/daszajz9a/image/upload/v1701313830/6567fd25ec30e86a7dc57d1c'
};
