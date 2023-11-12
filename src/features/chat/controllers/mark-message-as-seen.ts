import { IMessageData } from '@chat/interfaces/chat.interface';
import { chatQueue } from '@service/queues/chat.queue';
import { ChatCache } from '@service/redis/chat.cache';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';

const chatCache: ChatCache = new ChatCache();
export class Update {
  public async markAsSeen(req: Request, res: Response): Promise<void> {
    const { receiverId } = req.body;
    const senderId = req.currentUser!.userId;

    const lastUpdatedMessage: IMessageData = await chatCache.markMessagesAsSeen(senderId, receiverId) as IMessageData;
    //send to client with the last updated message
    //update chat list with and send to client
    chatQueue.addChatJob('markMessagesAsSeen', {
      senderId,
      receiverId
    });
    res.status(STATUS_CODE.OK).json({ message: 'message has been seen'});
  }
}
