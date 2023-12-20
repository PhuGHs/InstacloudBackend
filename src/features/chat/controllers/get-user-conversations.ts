import { IMessageData } from '@chat/interfaces/chat.interface';
import { chatService } from '@service/db/chat.service';
import { ChatCache } from '@service/redis/chat.cache';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';
import mongoose from 'mongoose';

const chatCache: ChatCache = new ChatCache();
export class Get {
  public async conversations(req: Request, res: Response): Promise<void> {
    const userConversations: IMessageData[] = (await chatCache.getConversationsOfUsers(req.currentUser!.userId)) as IMessageData[];
    const result: IMessageData[] = userConversations ? userConversations : await chatService.getConversations(req.currentUser!.userId);
    res.status(STATUS_CODE.OK).json({ message: 'user conversations', conversations: result });
  }

  public async messages(req: Request, res: Response): Promise<void> {
    const { receiverId } = req.params;
    let messages: IMessageData[] = [];
    const cachedMessages: IMessageData[] = await chatCache.getChatMessagesFromCache(req.currentUser!.userId, receiverId);
    if (cachedMessages.length > 0) {
      messages = cachedMessages;
    } else {
      messages = await chatService.getMessages(
        new mongoose.Types.ObjectId(req.currentUser!.userId),
        new mongoose.Types.ObjectId(receiverId),
        { createdAt: 1 }
      );
    }

    res.status(STATUS_CODE.OK).json({ message: 'conversation messages', messages });
  }
}
