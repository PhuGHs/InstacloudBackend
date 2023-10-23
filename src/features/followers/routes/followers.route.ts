import { Update } from '@follower/controllers/block-user';
import { Add } from '@follower/controllers/follow-user';
import { Get } from '@follower/controllers/get-followers';
import { Remove } from '@follower/controllers/unfollow-user';
import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';

class FollowerRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.get('/user/followers/:userId', authMiddleware.checkAuthentication, Get.prototype.followers);
    this.router.get('/user/following/:userId', authMiddleware.checkAuthentication, Get.prototype.following);

    this.router.put('/user/follow/:followerId', authMiddleware.checkAuthentication, Add.prototype.followers);
    this.router.put('/user/unfollow/:followeeId/:followerId', authMiddleware.checkAuthentication, Remove.prototype.follower);

    this.router.put('/user/block/:followerId', authMiddleware.checkAuthentication, Update.prototype.blockUser);
    this.router.put('/user/unblock/:followerId', authMiddleware.checkAuthentication, Update.prototype.unblockUser);
    return this.router;
  }
}

export const followerRoutes: FollowerRoutes = new FollowerRoutes();
