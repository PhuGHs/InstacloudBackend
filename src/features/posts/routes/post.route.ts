import { authMiddleware } from '@root/shared/globals/helpers/auth-middleware';
import express, { Router } from 'express';
import { Create } from '@post/controllers/create-post';
import { Update } from '@post/controllers/update-post';
import { Delete } from '../controllers/delete-post';
import { Get } from '../controllers/get-posts';

class PostRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.get('/post/all/:page', authMiddleware.checkAuthentication, Get.prototype.posts);
    this.router.get('/post/images/:page', authMiddleware.checkAuthentication, Get.prototype.postsWithImage);
    this.router.get('/post/videos/:page', authMiddleware.checkAuthentication, Get.prototype.postsWithVideo);

    this.router.post('/post', authMiddleware.checkAuthentication, Create.prototype.post);
    this.router.post('/post-with-image', authMiddleware.checkAuthentication, Create.prototype.postWithImage);
    this.router.post('/post-with-video', authMiddleware.checkAuthentication, Create.prototype.postWithVideo);

    this.router.put('/post-with-image/:postId', authMiddleware.checkAuthentication, Update.prototype.postWithImage);
    this.router.put('/post/:postId', authMiddleware.checkAuthentication, Update.prototype.post);
    this.router.put('/post-with-video/:postId', authMiddleware.checkAuthentication, Update.prototype.postWithVideo);

    this.router.delete('/post/:postId', authMiddleware.checkAuthentication, Delete.prototype.post);
    return this.router;
  }
}

export const postRoutes: PostRoutes = new PostRoutes();
