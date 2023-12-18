import { authMiddleware } from '@global/helpers/auth-middleware';
import { Delete } from '@notification/controllers/delete-notification';
import { Get } from '@notification/controllers/get-notifications';
import { Update } from '@notification/controllers/mark-as-seen';
import express, { Router } from 'express';

class NotificationRoute {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.put('/notification/:notificationId', authMiddleware.checkAuthentication, Update.prototype.notification);
    this.router.get('/notification', authMiddleware.checkAuthentication, Get.prototype.notification);
    this.router.delete('/notification/:notificationId', authMiddleware.checkAuthentication, Delete.prototype.notification);
    return this.router;
  }
}

export const notificationRoute: NotificationRoute = new NotificationRoute();
