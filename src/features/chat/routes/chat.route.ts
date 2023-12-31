import { Delete } from '@chat/controllers/delete-a-message';
import { Find } from '@chat/controllers/find-conversations';
import { Get } from '@chat/controllers/get-user-conversations';
import { Update } from '@chat/controllers/mark-message-as-seen';
import { Add } from '@chat/controllers/send-message';
import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';

class ChatRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.get('/chat/conversations', authMiddleware.checkAuthentication, Get.prototype.conversations);
    this.router.get('/chat/search/:query', authMiddleware.checkAuthentication, Find.prototype.conversations);
    this.router.get('/chat/message/user/:receiverId', authMiddleware.checkAuthentication, Get.prototype.messages);

    this.router.post('/chat/send-message', authMiddleware.checkAuthentication, Add.prototype.message);
    this.router.post('/chat/call-video', authMiddleware.checkAuthentication, Add.prototype.callVideo);
    this.router.post('/chat/call-video-socket', authMiddleware.checkAuthentication, Add.prototype.callVideoSocketReq);
    this.router.post('/chat/call-audio', authMiddleware.checkAuthentication, Add.prototype.callAudio);
    this.router.post('/chat/call-audio-socket', authMiddleware.checkAuthentication, Add.prototype.callAudioSocketReq);
    this.router.put('/chat/mark-as-seen', authMiddleware.checkAuthentication, Update.prototype.markAsSeen);
    this.router.put('/chat/mark-as-deleted', authMiddleware.checkAuthentication, Delete.prototype.message);

    return this.router;
  }
}

export const chatRoutes: ChatRoutes = new ChatRoutes();
