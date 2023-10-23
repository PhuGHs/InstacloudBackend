import { authMiddleware } from '@global/helpers/auth-middleware';
import { Update } from '@notification/controllers/mark-as-seen';
import express, { Router } from 'express';

class NotificationRoute {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.patch('/notification/:notificationId', authMiddleware.checkAuthentication, Update.prototype.notification);
    return this.router;
  }
}

export const notificationRoute: NotificationRoute = new NotificationRoute();
