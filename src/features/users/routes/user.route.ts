import { authMiddleware } from '@root/shared/globals/helpers/auth-middleware';
import { Get } from '@user/controllers/get-profile';
import { Search } from '@user/controllers/search-users';
import { BackgroundInformation } from '@user/controllers/update-background-info';
import { UpdateFullName } from '@user/controllers/update-fullname';
import { NotificationSettings } from '@user/controllers/update-noti-settings';
import { Update } from '@user/controllers/update-pasword';
import express, { Router } from 'express';

class UserRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.put('/user/update-password', authMiddleware.checkAuthentication, Update.prototype.password);
    this.router.put('/user/update-notification-settings', authMiddleware.checkAuthentication, NotificationSettings.prototype.notification);
    this.router.put('/user/update-background-info', authMiddleware.checkAuthentication, BackgroundInformation.prototype.user);
    this.router.put('/user/update-fullname', authMiddleware.checkAuthentication, UpdateFullName.prototype.fullname);
    this.router.get('/user/profile', authMiddleware.checkAuthentication, Get.prototype.profile);
    this.router.get('/user/profile/:userId', authMiddleware.checkAuthentication, Get.prototype.profileByUserId);
    this.router.get('/user/profile-materials/:userId/:username/:uId', authMiddleware.checkAuthentication, Get.prototype.profileMaterials);
    this.router.get('/user/suggestion', authMiddleware.checkAuthentication, Get.prototype.userSuggestion);
    this.router.get('/user/search', authMiddleware.checkAuthentication, Search.prototype.users);
    return this.router;
  }
}

export const userRoutes: UserRoutes = new UserRoutes();
