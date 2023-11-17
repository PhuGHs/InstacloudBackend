import mongoose, { Document } from 'mongoose';

export interface IConversationDocument extends Document {
  _id: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  links: ILinks[],
  images: IImages[],
}

export interface ILinks {
  link: string
}

export interface IImages {
  image: string
}

export interface ISearchConversation {
  _id: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  conversationName: string,
  conversationAvatar: string;
  links: ILinks[],
  images: IImages[],
}
