import { addChatSchema } from '@chat/schemes/chat.scheme';
import { joiValidation } from '@global/decorators/joi.validation';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';

export class Add {
  @joiValidation(addChatSchema)
  public async message(req: Request, res: Response): Promise<void> {
    
  }
}
