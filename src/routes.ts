import { Application } from 'express';
import { serverAdapter } from '@service/queues/base.queue';
import { authRoutes } from '@auth/routes/auth.route';
import { authMiddleware } from '@global/helpers/auth-middleware';
import { currentUserRoutes } from '@auth/routes/currentUser.route';
import { postRoutes } from '@post/routes/post.route';
import { commentRoute } from '@comment/routes/comment.route';
import { reactionRoutes } from '@reaction/routes/reaction.route';
import { followerRoutes } from '@follower/routes/followers.route';
import { notificationRoute } from '@notification/routes/notification.route';
import { chatRoutes } from '@chat/routes/chat.route';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BASE_PATH = '/api/v1';
export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.signOutRoutes());

    //require login
    app.use(BASE_PATH, authMiddleware.verifyUser, postRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, commentRoute.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, reactionRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, followerRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, notificationRoute.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, chatRoutes.routes());
  };
  routes();
};
