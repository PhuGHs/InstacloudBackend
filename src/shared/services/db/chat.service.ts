import { IMessageData, IMessageDocument } from '@chat/interfaces/chat.interface';
import { IConversationDocument } from '@chat/interfaces/conversation.interface';
import { MessageModel } from '@chat/models/chat.schema';
import { ConversationModel } from '@chat/models/conversation.schema';
import { UserModel } from '@user/models/user.schema';
import mongoose from 'mongoose';

class ChatService {
  public async findConversations(userId: string): Promise<void> {

  }

  public async addChatMessageToDB(data: IMessageData): Promise<void> {
    const conversation: IConversationDocument[] = await ConversationModel.find({_id: data.conversationId}).exec();
    if(conversation.length === 0) {
      await ConversationModel.create({
        _id: data.conversationId,
        senderId: data.senderId,
        receiverId: data.receiverId,
      });
    }

    await MessageModel.create(data);
  }
}

export const chatService: ChatService = new ChatService();
