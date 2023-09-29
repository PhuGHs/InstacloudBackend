import express, { Router } from 'express';
import { SignUp } from '@auth/controllers/signup';
import { SignIn } from '../controllers/signin';
import { CurrentUser } from '../controllers/current-user';
import { SignOut } from '../controllers/signout';

class AuthRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.post('/signup', SignUp.prototype.user);
    this.router.post('/signin', SignIn.prototype.user);
    this.router.get('/signout', SignOut.prototype.user);

    return this.router;
  }

  public signOutRoutes(): Router {
    this.router.get('/signout', SignOut.prototype.user);
    return this.router;
  }
}

export const authRoutes: AuthRoutes = new AuthRoutes();
