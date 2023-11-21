import { IMessageData } from '@chat/interfaces/chat.interface';
import { chatQueue } from '@service/queues/chat.queue';
import { ChatCache } from '@service/redis/chat.cache';
import { chatSocketIOObject } from '@socket/chat.socket';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';

const chatCache: ChatCache = new ChatCache();
export class Delete {
  public async message(req: Request, res: Response): Promise<void> {
    const { receiverId, messageId, type } = req.body;
    const senderId = req.currentUser!.userId;
    const updatedMessage: IMessageData = await chatCache.markMessageAsDeleted(senderId, receiverId, messageId, type as 'deleteForMe' | 'deleteForEveryone');
    chatSocketIOObject.emit('message read', updatedMessage);
    chatSocketIOObject.emit('chat list', updatedMessage);
    chatQueue.addChatJob('markMessageAsDeleted', {
      messageId: messageId,
      type
    });
    res.status(STATUS_CODE.OK).json({ message: `The message has been deleted with type: ${type}`});
  }
}
