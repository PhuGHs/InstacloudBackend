import { Application } from 'express';
import { serverAdapter } from './shared/services/queues/base.queue';
import { authRoutes } from './features/auth/routes/auth.route';
import { authMiddleware } from './shared/globals/helpers/auth-middleware';
import { currentUserRoutes } from './features/auth/routes/currentUser.route';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BASE_PATH = '/api/v1';
export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.signOutRoutes());

    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
  };
  routes();
};
