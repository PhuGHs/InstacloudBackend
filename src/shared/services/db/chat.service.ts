import { IMessageData, IMessageDocument } from '@chat/interfaces/chat.interface';
import { IConversationDocument } from '@chat/interfaces/conversation.interface';
import { MessageModel } from '@chat/models/chat.schema';
import { ConversationModel } from '@chat/models/conversation.schema';
import { SupportiveMethods } from '@global/helpers/supportive-methods';

class ChatService {
  public async findConversations(userId: string): Promise<void> {

  }

  public async addChatMessageToDB(data: IMessageData): Promise<void> {
    const conversation: IConversationDocument[] = await ConversationModel.find({_id: data.conversationId}).exec();
    const urls: string[] | null = SupportiveMethods.extractURLsFromString(data.body);
    if(conversation.length === 0) {
      await ConversationModel.create({
        _id: data.conversationId,
        senderId: data.senderId,
        receiverId: data.receiverId,
      });
    }
    if(data.selectedImage) {
      await ConversationModel.updateOne({ _id: data.conversationId}, {$push: { images: data.selectedImage }});
    }
    if(data.gifUrl) {
      await ConversationModel.updateOne({ _id: data.conversationId}, {$push: { images: data.gifUrl }});
    }
    if(urls) {
      for(const url of urls!) {
        await ConversationModel.updateOne({ _id: data.conversationId}, {$push: { links: url}});
      }
    }

    await MessageModel.create(data);
  }

  public async markMessagesAsSeen(senderId: string, receiverId: string): Promise<void> {
    await MessageModel.updateMany({ receiverId: senderId, senderId: receiverId, isRead: false }, { $set: { isRead: true }}).exec();
  }

  public async markMessageAsDeleted(messageId: string, type: 'deleteForMe' | 'deleteForEveryone'): Promise<void> {
    let update = {};
    if(type === 'deleteForMe') {
      update = { $set: { deleteForMe: true }};
    } else if(type === 'deleteForEveryone') {
      update = { $set: { deleteForMe: true, deleteForEveryone: true }};
    }
    await MessageModel.updateOne({ _id: messageId}, update);
  }
}

export const chatService: ChatService = new ChatService();
