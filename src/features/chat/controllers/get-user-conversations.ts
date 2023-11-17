import { IMessageData } from '@chat/interfaces/chat.interface';
import { chatService } from '@service/db/chat.service';
import { ChatCache } from '@service/redis/chat.cache';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';

const chatCache: ChatCache = new ChatCache();
export class Get {
  public async conversations(req: Request, res: Response): Promise<void> {
    const userConversations: IMessageData[] = await chatCache.getConversationsOfUsers(req.currentUser!.userId) as IMessageData[];
    const result: IMessageData[] =  userConversations ? userConversations : await chatService.getConversations(req.currentUser!.userId);
    res.status(STATUS_CODE.OK).json({ message: 'user conversations', conversations: result});
  }
}
