import mongoose from 'mongoose';

export interface IFileVideoDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId | string;
  videoId: string;
  videoVersion: string;
  createdAt: Date;
}

export interface IFileVideoJob {
  key1?: string;
  key2?: string;
  value?: IFileVideoDocument;
}
