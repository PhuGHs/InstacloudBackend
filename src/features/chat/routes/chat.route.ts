import { Add } from '@chat/controllers/send-message';
import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';

class ChatRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.post('/chat/send-message', authMiddleware.checkAuthentication, Add.prototype.message);

    return this.router;
  }
}

export const chatRoutes: ChatRoutes = new ChatRoutes();
