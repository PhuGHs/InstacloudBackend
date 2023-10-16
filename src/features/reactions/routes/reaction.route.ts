import { Add } from '@reaction/controllers/add-reactions';
import { authMiddleware } from '@root/shared/globals/helpers/auth-middleware';
import express, { Router } from 'express';

class ReactionRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.post('/post/reaction', authMiddleware.checkAuthentication, Add.prototype.reaction);
    this.router.post('/post/comment/reaction', authMiddleware.checkAuthentication, Add.prototype.commentReaction);
    return this.router;
  }
}

export const reactionRoutes: ReactionRoutes = new ReactionRoutes();
