import { Request, Response } from 'express';
import { CustomError } from '@global/helpers/error-handler';
import { authMock, authMockRequest, authMockResponse } from '@mock/auth.mock';
import { authService } from '@service/db/auth.service';
import { UserCache } from '@service/redis/user.cache';
import { SignIn } from '../signin';
import { SupportiveMethods } from '@global/helpers/supportive-methods';
import { userService } from '@service/db/user.service';
import { userdata } from '@mock/user.mock';

const USERNAME = 'phule';
const SHORT_USERNAME = 'van';
const LONG_USERNAME = 'vannnnnnnnnnnnnnnnn';

const PASSWORD = 'qwerty';
const SHORT_PASSWORD = '123';

jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/user.cache');
jest.mock('@service/queues/user.queue');
jest.mock('@service/queues/auth.queue');

describe('SignIn', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Throw an error if username is not available', () => {
    const req: Request = authMockRequest({}, {
      username: '', password: PASSWORD
    }) as Request;
    const res: Response = authMockResponse();

    SignIn.prototype.user(req, res).catch((error: CustomError) => {
      expect(error.code).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username is a required field');
    });
  });

  it('Throw an error if username length is less than 4 digits', () => {
    const req: Request = authMockRequest({}, {
      username: SHORT_USERNAME, password: PASSWORD
    }) as Request;
    const res: Response = authMockResponse();

    SignIn.prototype.user(req, res).catch((error: CustomError) => {
      expect(error.code).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('Throw an error if username length is greater than 12 digits', () => {
    const req: Request = authMockRequest({}, {
      username: LONG_USERNAME, password: PASSWORD
    }) as Request;
    const res: Response = authMockResponse();

    SignIn.prototype.user(req, res).catch((error: CustomError) => {
      expect(error.code).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('Throw an error if password is not available', () => {
    const req: Request = authMockRequest({}, {
      username: USERNAME, password: ''
    }) as Request;
    const res: Response = authMockResponse();

    SignIn.prototype.user(req, res).catch((error: CustomError) => {
      expect(error.code).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password is a required field');
    });
  });

  it('Throw an error if password length is greater than 4 digits', () => {
    const req: Request = authMockRequest({}, {
      username: USERNAME, password: SHORT_PASSWORD
    }) as Request;
    const res: Response = authMockResponse();

    SignIn.prototype.user(req, res).catch((error: CustomError) => {
      expect(error.code).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  it('Throw an error if password length is greater than 4 digits', () => {
    const req: Request = authMockRequest({}, {
      username: USERNAME, password: SHORT_PASSWORD
    }) as Request;
    const res: Response = authMockResponse();

    SignIn.prototype.user(req, res).catch((error: CustomError) => {
      expect(error.code).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  it('Throw an error if username doest exist', () => {
    const req: Request = authMockRequest({}, {
      username: USERNAME, password: PASSWORD
    }) as Request;
    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getAuthUserByUsernameOrEmail').mockResolvedValueOnce(null as any);

    SignIn.prototype.user(req, res).catch((error: CustomError) => {
      expect(authService.getAuthUserByUsernameOrEmail).toHaveBeenCalledWith(req.body.username, '');
      expect(error.code).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials!');
    });
  });

  // it('Throw an error if password doest exist', () => {
  //   const req: Request = authMockRequest({}, {
  //     username: USERNAME, password: SHORT_PASSWORD
  //   }) as Request;
  //   const res: Response = authMockResponse();

  //   jest.spyOn(authService, 'getAuthUserByUsernameOrEmail').mockResolvedValueOnce(null as any);

  //   SignIn.prototype.user(req, res).catch((error: CustomError) => {
  //     expect(authService.getAuthUserByUsernameOrEmail).toHaveBeenCalledWith(SupportiveMethods.uppercaseFirstLetter(req.body.username));
  //     expect(error.code).toEqual(400);
  //     expect(error.serializeErrors().message).toEqual('Invalid credentials!');
  //   });
  // });

  it('Set session data for valid credentials and send proper response', async () => {
    const req: Request = authMockRequest({}, {
      username: USERNAME, password: PASSWORD
    }) as Request;
    const res: Response = authMockResponse();

    authMock.comparePassword = () => Promise.resolve(true);
    jest.spyOn(authService, 'getAuthUserByUsernameOrEmail').mockResolvedValueOnce(authMock);
    jest.spyOn(userService, 'getUserByAuthId').mockResolvedValue(userdata);

    await SignIn.prototype.user(req, res);
    expect(req.session?.jwt).toBeDefined();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
        message: 'User logged in successfully',
        user: userdata,
        token: req.session?.jwt
    });
  });
});
