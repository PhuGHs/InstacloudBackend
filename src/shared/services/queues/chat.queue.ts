import { chatWorker } from '@worker/chat.worker';
import { BaseQueue } from './base.queue';
import { IChatJobData, IMessageData } from '@chat/interfaces/chat.interface';

class ChatQueue extends BaseQueue {
  constructor() {
    super('chat');
    this.processJob('addChatMessageToDB', 5, chatWorker.addChatMessageToDB);
    this.processJob('markMessagesAsSeen', 5, chatWorker.markMessagesAsSeen);
    this.processJob('markMessageAsDeleted', 5, chatWorker.markMessageAsDeleted);
  }

  public addChatJob(name: string, data: IChatJobData | IMessageData ) {
    this.addJob(name, data);
  }
}

export const chatQueue: ChatQueue = new ChatQueue();
