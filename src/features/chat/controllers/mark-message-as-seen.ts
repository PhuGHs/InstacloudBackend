import { IMessageData } from '@chat/interfaces/chat.interface';
import { chatQueue } from '@service/queues/chat.queue';
import { ChatCache } from '@service/redis/chat.cache';
import { chatSocketIOObject } from '@socket/chat.socket';
import { connectedUserMap } from '@socket/user.socket';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';

const chatCache: ChatCache = new ChatCache();
export class Update {
  public async markAsSeen(req: Request, res: Response): Promise<void> {
    const { receiverId } = req.body;
    const senderId = req.currentUser!.userId;

    const lastUpdatedMessage: IMessageData = (await chatCache.markMessagesAsSeen(senderId, receiverId)) as IMessageData;
    chatSocketIOObject.emit('message read', lastUpdatedMessage);
    chatSocketIOObject.emit('chat conversation', lastUpdatedMessage);
    //update chat list with and send to client
    chatQueue.addChatJob('markMessagesAsSeen', {
      senderId,
      receiverId
    });
    res.status(STATUS_CODE.OK).json({ message: 'message has been seen' });
  }
}
