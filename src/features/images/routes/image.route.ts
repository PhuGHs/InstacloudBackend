import { authMiddleware } from '@global/helpers/auth-middleware';
import { Add } from '@image/controllers/add-image';
import { Delete } from '@image/controllers/delete-image';
import { Get } from '@image/controllers/get-images';
import express, { Router } from 'express';

class ImageRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.post('/image/upload', authMiddleware.checkAuthentication, Add.prototype.image);
    this.router.get('/images', authMiddleware.checkAuthentication, Get.prototype.images);
    this.router.delete('/image/:imageId', authMiddleware.checkAuthentication, Delete.prototype.image);

    return this.router;
  }
}

export const imageRoutes: ImageRoutes = new ImageRoutes();
