import { Add } from '@reaction/controllers/add-reactions';
import { Get } from '@reaction/controllers/get-reactions';
import { Remove } from '@reaction/controllers/remove-reaction';
import { authMiddleware } from '@root/shared/globals/helpers/auth-middleware';
import express, { Router } from 'express';

class ReactionRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.get('/post/reactions/:postId', authMiddleware.checkAuthentication, Get.prototype.postReactions);
    this.router.get('/post/comment/reactions/:commentId', authMiddleware.checkAuthentication, Get.prototype.commentReactions);
    this.router.get('/post/comment/single-reaction/:commentId', authMiddleware.checkAuthentication, Get.prototype.singleCommentReaction);
    this.router.get('/post/single-reaction/:postId', authMiddleware.checkAuthentication, Get.prototype.singlePostReaction);


    this.router.post('/post/reaction', authMiddleware.checkAuthentication, Add.prototype.reaction);
    this.router.post('/post/comment/reaction', authMiddleware.checkAuthentication, Add.prototype.commentReaction);

    this.router.delete('/post/reaction/:postId/:postReactions', authMiddleware.checkAuthentication, Remove.prototype.postReaction);
    this.router.delete('/post/comment/reaction/:commentId/:commentReactions', authMiddleware.checkAuthentication, Remove.prototype.commentReaction);
    return this.router;
  }
}

export const reactionRoutes: ReactionRoutes = new ReactionRoutes();
