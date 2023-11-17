import { IMessageData, IMessageDocument } from '@chat/interfaces/chat.interface';
import { IConversationDocument } from '@chat/interfaces/conversation.interface';
import { MessageModel } from '@chat/models/chat.schema';
import { ConversationModel } from '@chat/models/conversation.schema';
import { SupportiveMethods } from '@global/helpers/supportive-methods';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.schema';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

class ChatService {
  public async findConversations(userId: string, query: string): Promise<IMessageData[]> {
    const userObjId: ObjectId = new mongoose.Types.ObjectId(userId);
    const users = await UserModel.aggregate([
      {
        $lookup: {
          from: 'Auth',
          localField: 'authId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $match: {
          $and: [
            { 'user.username': { $regex: query, $options: 'i' } },
            { '_id': { $ne: userObjId }}
          ]
        },
      },
      { $project: {
        _id: 1,
      }}
    ]);

    const list: ObjectId[] = users.map(user => user._id);

    const conversations: IMessageData[] = await MessageModel.aggregate([
      { $match: { $or: [
        { senderId: userObjId, receiverId: { $in: list}},
        { receiverId: userObjId, senderId: { $in: list}},
      ]  } },
      // { $lookup: { from: 'Conversation', localField: 'conversationId', foreignField: '_id', as: 'conversation'} },
      // { $unwind: '$conversation'},
      { $group: {
        _id: '$conversationId',
        result: { $last: '$$ROOT'}
      }},
      {
        $project: {
          _id: '$result._id',
          // links: '$conversation.links',
          // images: '$conversation.images',
          conversationId: '$result.conversationId',
          receiverId: '$result.receiverId',
          receiverUsername: '$result.receiverUsername',
          receiverProfilePicture: '$result.receiverProfilePicture',
          senderUsername: '$result.senderUsername',
          senderId: '$result.senderId',
          senderProfilePicture: '$result.senderProfilePicture',
          body: '$result.body',
          isRead: '$result.isRead',
          gifUrl: '$result.gifUrl',
          selectedImage: '$result.selectedImage',
          reaction: '$result.reaction',
          createdAt: '$result.createdAt',
        }
      },
      {
        $sort: { createdAt: 1 }
      }
    ]);

    // const conversations = await ConversationModel.find( {
    //   $or: [
    //     { senderId: userId, receiverId: { $in: list}},
    //     { receiverId: userId, senderId: { $in: list}},
    //   ]
    // });
    return conversations;
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

  public async getConversations(userId: string): Promise<IMessageData[]> {
    const userObjId: ObjectId = new mongoose.Types.ObjectId(userId);
    const list: IMessageData[] = await MessageModel.aggregate([
      { $match: { $or: [
        { senderId: userObjId },
        { receiverId: userObjId }
      ]  } },
      { $group: {
        _id: '$conversationId',
        result: { $last: '$$ROOT'}
      }},
      {
        $project: {
          _id: '$result._id',
          conversationId: '$result.conversationId',
          receiverId: '$result.receiverId',
          receiverUsername: '$result.receiverUsername',
          receiverProfilePicture: '$result.receiverProfilePicture',
          senderUsername: '$result.senderUsername',
          senderId: '$result.senderId',
          senderProfilePicture: '$result.senderProfilePicture',
          body: '$result.body',
          isRead: '$result.isRead',
          gifUrl: '$result.gifUrl',
          selectedImage: '$result.selectedImage',
          reaction: '$result.reaction',
          createdAt: '$result.createdAt',
        }
      },
      {
        $sort: { createdAt: 1 }
      }
    ]);
    return list;
  }
}

export const chatService: ChatService = new ChatService();
