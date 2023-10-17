import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';
import { Add } from '@comment/controllers/add-comment';
import { Get } from '@comment/controllers/get-comments';
import { Update } from '@comment/controllers/edit-comment';
import { Delete } from '@comment/controllers/delete-comment';

class CommentRoute {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.post('/post/comment', authMiddleware.checkAuthentication, Add.prototype.comment);

    this.router.get('/post/comments/:postId', authMiddleware.checkAuthentication, Get.prototype.comments);
    this.router.get('/post/comments/names/:postId', authMiddleware.checkAuthentication, Get.prototype.commentNames);
    this.router.get('/post/single-comment/:postId/:commentId', authMiddleware.checkAuthentication, Get.prototype.singleComment);

    this.router.put('/post/comment/:commentId', authMiddleware.checkAuthentication, Update.prototype.comment);

    this.router.delete('/post/comment/:postId/:commentId', authMiddleware.checkAuthentication, Delete.prototype.comment);
    return this.router;
  }
}

export const commentRoute: CommentRoute = new CommentRoute();
