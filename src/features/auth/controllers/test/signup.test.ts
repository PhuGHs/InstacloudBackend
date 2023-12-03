import { Request, Response } from 'express';
import * as cloudinaryUpload from '@global/helpers/cloudinary-upload';
import { SignUp } from '@auth/controllers/signup';
import { CustomError } from '@global/helpers/error-handler';
import { authMock, authMockRequest, authMockResponse } from '@mock/auth.mock';
import { authService } from '@service/db/auth.service';

jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/user.cache');
jest.mock('@service/queues/user.queue');
jest.mock('@service/queues/auth.queue');
jest.mock('@global/helpers/cloudinary-upload');

describe('SignUp', () => {
  it('Throw an error if username is not available', () => {
    const req: Request = authMockRequest({}, {
      username: '',
      email: 'levanphu2003248@gmail.com',
      firstname: 'Le Van',
      lastname: 'Phu',
      password: 'qwerty',
      avatarImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png',
    }) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.user(req, res).catch((error: CustomError) => {
      expect(error.code).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username is a required field');
    });
  });

  it('Throw an error if username length is less than minimum length', () => {
    const req: Request = authMockRequest({}, {
      username: 'van',
      email: 'levanphu2003248@gmail.com',
      firstname: 'Le Van',
      lastname: 'Phu',
      password: 'qwerty',
      avatarImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png',
    }) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.user(req, res).catch((error: CustomError) => {
      expect(error.code).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username length must be more than or equal to 4 digits');
    });
  });

  it('Throw an error if username length is more than maximum length', () => {
    const req: Request = authMockRequest({}, {
      username: 'vanodpsajodsajdsa',
      email: 'levanphu2003248@gmail.com',
      firstname: 'Le Van',
      lastname: 'Phu',
      password: 'qwerty',
      avatarImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png',
    }) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.user(req, res).catch((error: CustomError) => {
      expect(error.code).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username length must be lower than or equal to 12 digits');
    });
  });

  it('Throw an error if email is not available', () => {
    const req: Request = authMockRequest({}, {
      username: 'vanphu',
      email: '',
      firstname: 'Le Van',
      lastname: 'Phu',
      password: 'qwerty',
      avatarImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png',
    }) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.user(req, res).catch((error: CustomError) => {
      expect(error.code).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email is a required field');
    });
  });

  it('Throw an error if email is not valid', () => {
    const req: Request = authMockRequest({}, {
      username: 'vanphu',
      email: 'levanphu2003248gmail.com',
      firstname: 'Le Van',
      lastname: 'Phu',
      password: 'qwerty',
      avatarImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png',
    }) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.user(req, res).catch((error: CustomError) => {
      expect(error.code).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email must be valid');
    });
  });

  it('Throw an error if password is less than 4 digits', () => {
    const req: Request = authMockRequest({}, {
      username: 'vanphu',
      email: 'levanphu2003248@gmail.com',
      firstname: 'Le Van',
      lastname: 'Phu',
      password: 'qwerty',
      avatarImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png',
    }) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.user(req, res).catch((error: CustomError) => {
      expect(error.code).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password length must be more than or equal to 4 digits');
    });
  });

  it('Throw an unauthorized error if user is already exist', () => {
    const req: Request = authMockRequest({}, {
      username: 'Thankful',
      email: 'levanphu2003248@gmail.com',
      firstname: 'Le Van',
      lastname: 'Phu',
      password: 'qwerty',
      avatarImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png',
    }) as Request;
    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getAuthUserByUsernameOrEmail').mockResolvedValue(authMock);

    SignUp.prototype.user(req, res).catch((error: CustomError) => {
      expect(error.code).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials!');
    });
  });
});
