import { IMessageData } from '@chat/interfaces/chat.interface';
import { addChatSchema } from '@chat/schemes/chat.scheme';
import { joiValidation } from '@global/decorators/joi.validation';
import { upload } from '@global/helpers/cloudinary-upload';
import { BadRequestError } from '@global/helpers/error-handler';
import { SupportiveMethods } from '@global/helpers/supportive-methods';
import { chatService } from '@service/db/chat.service';
import { userService } from '@service/db/user.service';
import { chatQueue } from '@service/queues/chat.queue';
import { ChatCache } from '@service/redis/chat.cache';
import { UserCache } from '@service/redis/user.cache';
import { SocketIOChatHandler, chatSocketIOObject } from '@socket/chat.socket';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

const chatCache: ChatCache = new ChatCache();
const userCache: UserCache = new UserCache();
export class Add {
  @joiValidation(addChatSchema)
  public async message(req: Request, res: Response): Promise<void> {
    const { conversationId, receiverId, receiverUsername, receiverProfilePicture, body, gifUrl, selectedImage } = req.body;
    const messageObjectId: ObjectId = new ObjectId();
    const conversationObjectId: ObjectId = !conversationId ? new ObjectId() : new mongoose.Types.ObjectId(conversationId);
    let image = '';
    const cachedSender: IUserDocument = (await userCache.getUserFromCache(req.currentUser!.userId)) as IUserDocument;
    const Sender: IUserDocument = cachedSender ? cachedSender : await userService.getUserById(req.currentUser!.userId);
    const senderId: string = req.currentUser!.userId;
    if (selectedImage) {
      const result1: UploadApiResponse = (await upload(selectedImage, `${req.currentUser!.userId}`, true, true)) as UploadApiResponse;
      if (!result1?.public_id) {
        throw new BadRequestError('File upload error. Please try again!');
      }
      image = `https://res.cloudinary.com/daszajz9a/image/upload/v${result1.version}/${result1.public_id}`;
    }

    const data: IMessageData = {
      _id: `${messageObjectId}`,
      conversationId: new mongoose.Types.ObjectId(conversationObjectId),
      receiverId,
      receiverUsername,
      receiverProfilePicture,
      senderId: req.currentUser!.userId,
      senderUsername: req.currentUser!.username,
      senderProfilePicture: Sender.profilePicture,
      body,
      isRead: false,
      isVideoCall: false,
      isAudioCall: false,
      gifUrl,
      selectedImage: image,
      reaction: [],
      createdAt: new Date(),
      deleteForMe: false,
      deleteForEveryone: false
    } as IMessageData;

    Add.prototype.emitSocketIOEvent(data);

    await chatCache.addNewConversationToCache(senderId, receiverId, `${conversationObjectId}`);
    await chatCache.addNewConversationToCache(receiverId, senderId, `${conversationObjectId}`);
    await chatCache.addMessageToCache(`${conversationObjectId}`, data, SupportiveMethods.extractURLsFromString(body));

    chatQueue.addChatJob('addChatMessageToDB', data);
    res.status(STATUS_CODE.OK).json({ message: 'message has been sent', data });
  }

  public async callVideoSocketReq(req: Request, res: Response): Promise<void> {
    const { conversationId, receiverId, receiverUsername, receiverProfilePicture, body, gifUrl, selectedImage } = req.body;
    const messageObjectId: ObjectId = new ObjectId();
    const conversationObjectId: ObjectId = !conversationId ? new ObjectId() : new mongoose.Types.ObjectId(conversationId);
    let image = '';
    const cachedSender: IUserDocument = (await userCache.getUserFromCache(req.currentUser!.userId)) as IUserDocument;
    const Sender: IUserDocument = cachedSender ? cachedSender : await userService.getUserById(req.currentUser!.userId);
    const senderId: string = req.currentUser!.userId;
    if (selectedImage) {
      const result1: UploadApiResponse = (await upload(selectedImage, `${req.currentUser!.userId}`, true, true)) as UploadApiResponse;
      if (!result1?.public_id) {
        throw new BadRequestError('File upload error. Please try again!');
      }
      image = `https://res.cloudinary.com/daszajz9a/image/upload/v${result1.version}/${result1.public_id}`;
    }

    const data: IMessageData = {
      _id: `${messageObjectId}`,
      conversationId: new mongoose.Types.ObjectId(conversationObjectId),
      receiverId,
      receiverUsername,
      receiverProfilePicture,
      senderId: req.currentUser!.userId,
      senderUsername: req.currentUser!.username,
      senderProfilePicture: Sender.profilePicture,
      body,
      isRead: false,
      isVideoCall: true,
      isAudioCall: false,
      gifUrl,
      selectedImage: image,
      reaction: [],
      createdAt: new Date(),
      deleteForMe: false,
      deleteForEveryone: false
    } as IMessageData;

    chatSocketIOObject.emit('call user', data);
    res.status(STATUS_CODE.OK).json({ message: 'message has been sent' });
  }

  public async callVideo(req: Request, res: Response): Promise<void> {
    const { conversationId, receiverId, receiverUsername, receiverProfilePicture, body, gifUrl, selectedImage } = req.body;
    const messageObjectId: ObjectId = new ObjectId();
    const conversationObjectId: ObjectId = !conversationId ? new ObjectId() : new mongoose.Types.ObjectId(conversationId);
    let image = '';
    const cachedSender: IUserDocument = (await userCache.getUserFromCache(req.currentUser!.userId)) as IUserDocument;
    const Sender: IUserDocument = cachedSender ? cachedSender : await userService.getUserById(req.currentUser!.userId);
    const senderId: string = req.currentUser!.userId;
    if (selectedImage) {
      const result1: UploadApiResponse = (await upload(selectedImage, `${req.currentUser!.userId}`, true, true)) as UploadApiResponse;
      if (!result1?.public_id) {
        throw new BadRequestError('File upload error. Please try again!');
      }
      image = `https://res.cloudinary.com/daszajz9a/image/upload/v${result1.version}/${result1.public_id}`;
    }

    const data: IMessageData = {
      _id: `${messageObjectId}`,
      conversationId: new mongoose.Types.ObjectId(conversationObjectId),
      receiverId,
      receiverUsername,
      receiverProfilePicture,
      senderId: req.currentUser!.userId,
      senderUsername: req.currentUser!.username,
      senderProfilePicture: Sender.profilePicture,
      body,
      isRead: false,
      isVideoCall: true,
      isAudioCall: false,
      gifUrl,
      selectedImage: image,
      reaction: [],
      createdAt: new Date(),
      deleteForMe: false,
      deleteForEveryone: false
    } as IMessageData;

    chatSocketIOObject.emit('call user', data);
    Add.prototype.emitSocketIOEvent(data);

    await chatCache.addNewConversationToCache(senderId, receiverId, `${conversationObjectId}`);
    await chatCache.addNewConversationToCache(receiverId, senderId, `${conversationObjectId}`);
    await chatCache.addMessageToCache(`${conversationObjectId}`, data, SupportiveMethods.extractURLsFromString(body));

    chatQueue.addChatJob('addChatMessageToDB', data);
    res.status(STATUS_CODE.OK).json({ message: 'message has been sent', data });
  }


  public async callAudioSocketReq(req: Request, res: Response): Promise<void> {
    const { conversationId, receiverId, receiverUsername, receiverProfilePicture, body, gifUrl, selectedImage } = req.body;
    const messageObjectId: ObjectId = new ObjectId();
    const conversationObjectId: ObjectId = !conversationId ? new ObjectId() : new mongoose.Types.ObjectId(conversationId);
    let image = '';
    const cachedSender: IUserDocument = (await userCache.getUserFromCache(req.currentUser!.userId)) as IUserDocument;
    const Sender: IUserDocument = cachedSender ? cachedSender : await userService.getUserById(req.currentUser!.userId);
    const senderId: string = req.currentUser!.userId;
    if (selectedImage) {
      const result1: UploadApiResponse = (await upload(selectedImage, `${req.currentUser!.userId}`, true, true)) as UploadApiResponse;
      if (!result1?.public_id) {
        throw new BadRequestError('File upload error. Please try again!');
      }
      image = `https://res.cloudinary.com/daszajz9a/image/upload/v${result1.version}/${result1.public_id}`;
    }

    const data: IMessageData = {
      _id: `${messageObjectId}`,
      conversationId: new mongoose.Types.ObjectId(conversationObjectId),
      receiverId,
      receiverUsername,
      receiverProfilePicture,
      senderId: req.currentUser!.userId,
      senderUsername: req.currentUser!.username,
      senderProfilePicture: Sender.profilePicture,
      body,
      isRead: false,
      isVideoCall: false,
      isAudioCall: true,
      gifUrl,
      selectedImage: image,
      reaction: [],
      createdAt: new Date(),
      deleteForMe: false,
      deleteForEveryone: false
    } as IMessageData;
    chatSocketIOObject.emit('call user', data);
    res.status(STATUS_CODE.OK).json({ message: 'message has been sent', data });
  }

  public async callAudio(req: Request, res: Response): Promise<void> {
    const { conversationId, receiverId, receiverUsername, receiverProfilePicture, body, gifUrl, selectedImage } = req.body;
    const messageObjectId: ObjectId = new ObjectId();
    const conversationObjectId: ObjectId = !conversationId ? new ObjectId() : new mongoose.Types.ObjectId(conversationId);
    let image = '';
    const cachedSender: IUserDocument = (await userCache.getUserFromCache(req.currentUser!.userId)) as IUserDocument;
    const Sender: IUserDocument = cachedSender ? cachedSender : await userService.getUserById(req.currentUser!.userId);
    const senderId: string = req.currentUser!.userId;
    if (selectedImage) {
      const result1: UploadApiResponse = (await upload(selectedImage, `${req.currentUser!.userId}`, true, true)) as UploadApiResponse;
      if (!result1?.public_id) {
        throw new BadRequestError('File upload error. Please try again!');
      }
      image = `https://res.cloudinary.com/daszajz9a/image/upload/v${result1.version}/${result1.public_id}`;
    }

    const data: IMessageData = {
      _id: `${messageObjectId}`,
      conversationId: new mongoose.Types.ObjectId(conversationObjectId),
      receiverId,
      receiverUsername,
      receiverProfilePicture,
      senderId: req.currentUser!.userId,
      senderUsername: req.currentUser!.username,
      senderProfilePicture: Sender.profilePicture,
      body,
      isRead: false,
      isVideoCall: false,
      isAudioCall: true,
      gifUrl,
      selectedImage: image,
      reaction: [],
      createdAt: new Date(),
      deleteForMe: false,
      deleteForEveryone: false
    } as IMessageData;
    Add.prototype.emitSocketIOEvent(data);

    await chatCache.addNewConversationToCache(senderId, receiverId, `${conversationObjectId}`);
    await chatCache.addNewConversationToCache(receiverId, senderId, `${conversationObjectId}`);
    await chatCache.addMessageToCache(`${conversationObjectId}`, data, SupportiveMethods.extractURLsFromString(body));

    chatQueue.addChatJob('addChatMessageToDB', data);
    res.status(STATUS_CODE.OK).json({ message: 'message has been sent', data });
  }

  private emitSocketIOEvent(data: IMessageData): void {
    chatSocketIOObject.emit('message receive', data);
    chatSocketIOObject.emit('chat conversation', data);
  }
}
