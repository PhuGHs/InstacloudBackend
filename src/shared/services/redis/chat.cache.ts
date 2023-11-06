import { RedisCommandRawReply } from '@redis/client/dist/lib/commands';
import { config } from '@root/config';
import { ICommentDocument, ICommentNameList, ISaveCommentToCache } from '@root/features/comments/interfaces/comment.interface';
import { ServerError } from '@root/shared/globals/helpers/error-handler';
import { SupportiveMethods } from '@root/shared/globals/helpers/supportive-methods';
import { BaseCache } from '@service/redis/base.cache';
import Logger from 'bunyan';
import { IChatList, IMessageData } from '@chat/interfaces/chat.interface';
import { findIndex } from 'lodash';
import { IConversationDocument, IImages, ILinks } from '@chat/interfaces/conversation.interface';

export type CommentMultiType = string | number | Buffer | RedisCommandRawReply[] | ICommentDocument | ICommentDocument[];
const log: Logger = config.createLogger('commentCache');
export class CommentCache extends BaseCache {
  constructor() {
    super('commentCache');
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
        if(!isExist) {
          await this.client.RPUSH(`conversations:${senderId}`, JSON.stringify({ receiverId, conversationId, links, images}));
        }
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Try again!');
    }
  }

  public async addMessageToCache(key: string, value: IMessageData, isLink: boolean): Promise<void> {
    try {
      if (!this.client.isOpen) {
        this.client.connect();
      }
      this.client.RPUSH(`messages:${key}`, JSON.stringify(value));
      const conversation = await this.getASingleConversation(JSON.stringify(value.conversationId), value.senderId);
      if(value.selectedImage) {
        conversation.images.push(value.selectedImage as unknown as IImages);
      }
      if (value.gifUrl) {
        conversation.images.push(value.gifUrl as unknown as IImages);
      }
      if(isLink) {
        conversation.links.push(value.body as unknown as ILinks);
      }
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

  private async getASingleConversation(conversationId: string, senderId: string): Promise<IConversationDocument> {
    try {
      if (!this.client.isOpen) {
        this.client.connect();
      }
      const result: IConversationDocument[] = [];
      const conversations: string[] = await this.client.LRANGE(`conversations:${senderId}`, 0, -1);
      for(const item of conversations) {
        if (item.includes(conversationId)) {
          result.push(SupportiveMethods.parseJson(item) as IConversationDocument);
        }
      }
      return result[0];
    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Try again!');
    }
  }
}
