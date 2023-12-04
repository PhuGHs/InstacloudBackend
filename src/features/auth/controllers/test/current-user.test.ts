import { Request, Response } from 'express';
import { CustomError } from '@global/helpers/error-handler';
import { authMock, authMockRequest, authMockResponse, authUserPayload } from '@mock/auth.mock';
import { CurrentUser } from '../current-user';
import { UserCache } from '@service/redis/user.cache';
import { userdata } from '@mock/user.mock';
import { getTokenSourceMapRange } from 'typescript';

jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/user.cache');
jest.mock('@service/db/user.service');

describe('CurrentUser', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('token', () => {
    it('Set session token and send correct json response', async () => {
      const req: Request = authMockRequest({ jwt: 'dsadadsa'}, { username: 'phule', password: 'qwerty'}, authUserPayload) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(userdata);

      await CurrentUser.prototype.information(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        token: req.session?.jwt,
        isUser: true,
        user: userdata
      });
    });
  });
});
