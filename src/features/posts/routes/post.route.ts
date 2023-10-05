import { authMiddleware } from '@root/shared/globals/helpers/auth-middleware';
import express, { Router } from 'express';
import { Create } from '@post/controllers/create-post';
import { Update } from '@post/controllers/update-post';

class PostRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.post('/post', authMiddleware.checkAuthentication, Create.prototype.post);
    this.router.post('/post-with-image', authMiddleware.checkAuthentication, Create.prototype.postWithImage);

    this.router.put('/post-with-image/:postId', authMiddleware.checkAuthentication, Update.prototype.postWithImage);
    this.router.put('/post/:postId', authMiddleware.checkAuthentication, Update.prototype.post);
    return this.router;
  }
}

export const postRoutes: PostRoutes = new PostRoutes();
