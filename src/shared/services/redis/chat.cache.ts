import { config } from '@root/config';
import { ServerError } from '@root/shared/globals/helpers/error-handler';
import { SupportiveMethods } from '@root/shared/globals/helpers/supportive-methods';
import { BaseCache } from '@service/redis/base.cache';
import Logger from 'bunyan';
import { IChatList, IMessageData } from '@chat/interfaces/chat.interface';
import { find, findIndex } from 'lodash';
import { IConversationDocument, IImages, ILinks } from '@chat/interfaces/conversation.interface';

const log: Logger = config.createLogger('chatCache');
export class ChatCache extends BaseCache {
  constructor() {
    super('chatCache');
  }
  public async addNewConversationToCache(conversationId: string, senderId: string, receiverId: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        this.client.connect();
      }
      const links: ILinks[] = [];
      const images: IImages[] = [];
      const conversationsOfUser = await this.client.LRANGE(`conversations:${senderId}`, 0, -1);
      if(conversationsOfUser.length === 0) {
        await this.client.RPUSH(`conversations:${senderId}`, JSON.stringify({ receiverId, conversationId, links, images}));
      } else {
        const isExist = findIndex(conversationsOfUser, (conversation) =>  conversation.includes(receiverId));
        if(isExist === -1) {
          await this.client.RPUSH(`conversations:${senderId}`, JSON.stringify({ receiverId, conversationId, links, images}));
        }
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Try again!');
    }
  }

  public async addMessageToCache(key: string, value: IMessageData, urls: string[] | null): Promise<void> {
    try {
      if (!this.client.isOpen) {
        this.client.connect();
      }
      this.client.RPUSH(`messages:${key}`, JSON.stringify(value));
      const conversation = await this.getASingleConversation(JSON.stringify(value.conversationId), value.senderId);
      if(value.selectedImage) {
        conversation[0].images.push(value.selectedImage as unknown as IImages);
      }
      if (value.gifUrl) {
        conversation[0].images.push(value.gifUrl as unknown as IImages);
      }
      if(urls) {
        for(const url of urls!) {
          conversation[0].links.push(url as unknown as ILinks);
        }
      }
      await this.client.LSET(`conversations:${value.senderId}`, conversation[1], JSON.stringify(conversation[0]));
      await this.client.LSET(`conversations:${value.receiverId}`, conversation[1], JSON.stringify(conversation[0]));
    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Try again!');
    }
  }

  public async getConversationsOfUsers(userId: string): Promise<IMessageData[]> {
    try {
      if(!this.client.isOpen) {
        await this.client.connect();
      }
      const list: IMessageData[] = [];
      const conversations: string[] = await this.client.LRANGE(`conversations:${userId}`, 0, -1);
      conversations.forEach(async (item) => {
        const conversation = SupportiveMethods.parseJson(item) as IChatList;
        const lastMessage: string | null = await this.client.LINDEX(`messages:${conversation.conversationId}`, -1);
        list.push(SupportiveMethods.parseJson(lastMessage!));
      });
      return list;
    } catch(error) {
      log.error(error);
      throw new ServerError('Server Error. Try again!');
    }
  }

  private async getASingleConversation(conversationId: string, senderId: string): Promise<[IConversationDocument, number]> {
    try {
      if (!this.client.isOpen) {
        this.client.connect();
      }
      const result: IConversationDocument[] = [];
      const conversations: string[] = await this.client.LRANGE(`conversations:${senderId}`, 0, -1);
      const index = conversations.findIndex(item => item.includes(conversationId));
      if(index !== -1) {
        result.push(SupportiveMethods.parseJson(conversations[index]) as IConversationDocument);
      }
      return [result[0], index];
    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Try again!');
    }
  }

  public async markMessagesAsSeen(senderId: string, receiverId: string): Promise<IMessageData> {
    try {
      if (!this.client.isOpen) {
        this.client.connect();
      }
      const userConversation: string[] = await this.client.LRANGE(`conversations:${senderId}`, 0, -1);
      const cachedReceiver: string = find(userConversation, (item: string) => item.includes(receiverId)) as string;
      const receiver: IChatList = SupportiveMethods.parseJson(cachedReceiver) as IChatList;
      const messages: string[] = await this.client.LRANGE(`messages:${receiver.conversationId}`, 0, -1);
      const unreadMessages = messages.filter((item: string) => {
        const message: IMessageData = SupportiveMethods.parseJson(item);
        return message.isRead === false && message.receiverId === senderId;
      });
      console.log(unreadMessages);
      for(const [index, item] of unreadMessages.entries()) {
        const messageItem: IMessageData = SupportiveMethods.parseJson(item) as IMessageData;
        const index1 = findIndex(messages, (message) => message.includes(`${messageItem._id}`));
        messageItem.isRead = true;
        await this.client.LSET(`messages:${messageItem.conversationId}`, index1, JSON.stringify(messageItem));
      }

      const lastMessage: string = await this.client.LINDEX(`messages:${receiver.conversationId}`, -1) as string;
      return SupportiveMethods.parseJson(lastMessage);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Try again!');
    }
  }
}
