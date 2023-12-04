import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { AuthPayload } from '@auth/interfaces/auth.interface';
import { Request, Response } from 'express';

export const postMockRequest = (body: IPostBody, currentUser?: AuthPayload | null, params?: IParameters) => ({
  body,
  params,
  currentUser
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
  profilePicture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png',
  gifUrl: '',
};

export const postWithImage: IPostBody = {
  post: 'hello',
  privacy: 'public',
  profilePicture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png',
  gifUrl: '',
  image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png'
};

export const postWithImageFieldEmpty: IPostBody = {
  post: 'hello',
  privacy: 'public',
  profilePicture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png',
  gifUrl: '',
  image: ''
};

export const postWithVideo: IPostBody = {
  post: 'hello',
  privacy: 'public',
  profilePicture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png',
  gifUrl: '',
  video: 'https://www.youtube.com/watch?v=t5sFkGk8GY8&ab_channel=AnsontheDeveloper'
};

export const postWithVideoFieldEmpty: IPostBody = {
  post: 'hello',
  privacy: 'public',
  profilePicture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png',
  gifUrl: '',
  video: ''
};



export interface IPostBody {
  post: string;
  privacy?: string;
  gifUrl?: string;
  profilePicture?: string;
  image?: string;
  video?: string;
}

export interface IParameters {
  postId?: string;
  page?: string;
}
