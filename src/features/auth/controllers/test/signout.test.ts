import { Request, Response } from 'express';
import { CustomError } from '@global/helpers/error-handler';
import { authMock, authMockRequest, authMockResponse } from '@mock/auth.mock';
import { SignOut } from '../signout';

describe('SignOut', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Make sure that the session is null', () => {
    const req: Request = authMockRequest({}, {}) as Request;
    const res: Response = authMockResponse();

    SignOut.prototype.user(req, res);
    expect(req.session).toBeNull;
    expect(res.json).toHaveBeenCalledWith({
      message: 'Log out successfully!',
      user: {},
      token: {},
    });
  });
});
