import express, { Router } from 'express';
import { SignUp } from '@auth/controllers/signup';
import { SignIn } from '@auth/controllers/signin';
import { SignOut } from '@auth/controllers/signout';
import { Password } from '@auth/controllers/reset-password';

class AuthRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.post('/signup', SignUp.prototype.user);
    this.router.post('/signin', SignIn.prototype.user);
    this.router.get('/signout', SignOut.prototype.user);
    this.router.post('/forgot-password', Password.prototype.create);
    this.router.post('/reset-password/:token', Password.prototype.update);

    return this.router;
  }

  public signOutRoutes(): Router {
    this.router.get('/signout', SignOut.prototype.user);
    return this.router;
  }
}

export const authRoutes: AuthRoutes = new AuthRoutes();
