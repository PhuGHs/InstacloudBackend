import { AuthPayload, IAuthDocument } from '@auth/interfaces/auth.interface';
import { Response } from 'express';

export const authMockRequest = (sessionData: IJWT, body: IAuthMock, currentUser?: AuthPayload | null, params?: any) => ({
  session: sessionData,
  body,
  params,
  currentUser
});

export const authMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

export const authUserPayload: AuthPayload = {
  userId: '60263f14648fed5246e322d9',
  uId: '1621613119252066',
  username: 'phule',
  fullname: 'Phu Le',
  email: 'phule@gmail.com',
  iat: 12345
};

export const authMock = {
  _id: '60263f14648fed5246e322d3',
  uId: '1621613119252066',
  username: 'phule',
  fullname: 'Phu Le',
  email: 'phule@gmail.com',
  createdAt: '2022-08-31T07:42:24.451Z',
  save: () => {},
  comparePassword: () => false
} as unknown as IAuthDocument;

export interface IJWT {
  jwt?: string,
}

export interface IAuthMock {
  _id?: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  password?: string;
  avatarImage?: string;
  createdAt?: Date | string;
}
