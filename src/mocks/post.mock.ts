import { AuthPayload } from '@auth/interfaces/auth.interface';
import { Request, Response } from 'express';
import { IPostDocument, ISavePostDocument } from '@post/interfaces/post.interface';
import mongoose from 'mongoose';
import { userdata } from './user.mock';

export const postMockRequest = (body?: IPostBody, currentUser?: AuthPayload | null, params?: IParameters, query?: IQuery) => ({
  body,
  params,
  currentUser,
  query
});

export const postMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

export const post: IPostBody = {
  post: 'hello',
  privacy: 'public',
  profilePicture:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png',
  gifUrl: ''
};

export const postWithImage: IPostBody = {
  post: 'hello',
  privacy: 'public',
  profilePicture:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png',
  gifUrl: '',
  image:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png'
};

export const postWithImageFieldEmpty: IPostBody = {
  post: 'hello',
  privacy: 'public',
  profilePicture:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png',
  gifUrl: '',
  image: ''
};

export const postWithVideo: IPostBody = {
  post: 'hello',
  privacy: 'public',
  profilePicture:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png',
  gifUrl: '',
  video: 'https://www.youtube.com/watch?v=t5sFkGk8GY8&ab_channel=AnsontheDeveloper'
};

export const postWithVideoFieldEmpty: IPostBody = {
  post: 'hello',
  privacy: 'public',
  profilePicture:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png',
  gifUrl: '',
  video: ''
};

export const savedPost: ISavePostDocument = {
  userId: '60263f14648fed5246e322d9',
  username: 'phule',
  postId: '6568049ff9ecc21f63864821',
  createdAt: new Date()
} as unknown as ISavePostDocument;

export const postMockData: IPostDocument = {
  _id: new mongoose.Types.ObjectId('6027f77087c9d9ccb1555268'),
  userId: userdata._id,
  username: userdata.username,
  email: userdata.email,
  profilePicture: userdata.profilePicture,
  post: 'how are you?',
  imgId: '',
  imgVersion: '',
  feelings: 'happy',
  gifUrl: '',
  privacy: 'Public',
  commentsCount: 0,
  createdAt: new Date(),
  reactions: {
    like: 0,
    love: 0,
    happy: 0,
    wow: 0,
    sad: 0,
    angry: 0
  }
} as unknown as IPostDocument;

export const updatedPost = {
  profilePicture: postMockData.profilePicture,
  post: postMockData.post,
  feelings: 'wow',
  privacy: 'Private',
  gifUrl: '',
  imgId: '',
  imgVersion: ''
};

export const updatedPostWithImage = {
  profilePicture: postMockData.profilePicture,
  post: 'Wonderful',
  feelings: 'wow',
  privacy: 'Private',
  gifUrl: '',
  imgId: '',
  imgVersion: '',
  image: ''
};

export interface IPostBody {
  post: string;
  privacy?: string;
  gifUrl?: string;
  profilePicture?: string;
  image?: string;
  video?: string;
  postId?: string;
}

export interface IParameters {
  postId?: string;
  commentId?: string;
  page?: string;
}

export interface IQuery {
  query: string;
}
