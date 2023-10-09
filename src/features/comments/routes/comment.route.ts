import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';
import { Add } from '@comment/controllers/add-comment';

class CommentRoute {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.post('/comment', authMiddleware.checkAuthentication, Add.prototype.comment);

    return this.router;
  }
}

export const commentRoute: CommentRoute = new CommentRoute();
