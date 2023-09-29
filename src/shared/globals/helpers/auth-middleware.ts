import { Request, Response, NextFunction } from 'express';
import { AuthPayload } from '@root/features/auth/interfaces/auth.interface';
import jwt from 'jsonwebtoken';
import { NotAuthorizedError } from '@global/helpers/error-handler';
import { config } from '@root/config';

class AuthMiddleware {
  public async verifyUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    if(!req.session?.jwt) {
      throw new NotAuthorizedError('Token is not available. Please login first!');
    }
    try {
      const user: AuthPayload = jwt.verify(req.session?.jwt, config.JWT_TOKEN!) as AuthPayload;
      req.currentUser = user;
    } catch(error) {
      throw new NotAuthorizedError('Token is invalid! Please login first!');
    }
    next();
  }

  public async checkAuthentication(req: Request, res: Response, next: NextFunction): Promise<void> {
    if(!req.currentUser) {
      throw new NotAuthorizedError('Authentication is required to access this route');
    }
    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
