import { IMessageData } from '@chat/interfaces/chat.interface';
import { IConversationDocument } from '@chat/interfaces/conversation.interface';
import { chatService } from '@service/db/chat.service';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';

export class Find {
  public async conversations(req: Request, res: Response): Promise<void> {
    const conversations: IMessageData[] = await chatService.findConversations(req.currentUser!.userId, req.params.query);
    res.status(STATUS_CODE.OK).json({ message: 'results found: ', conversations});
  }
}
