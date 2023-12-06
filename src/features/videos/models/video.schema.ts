import mongoose, { model, Model, Schema } from 'mongoose';
import { IFileVideoDocument } from '../interfaces/video.interface';

const videoSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  videoVersion: { type: String, default: '' },
  videoId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now, index: true }
});

const VideoModel: Model<IFileVideoDocument> = model<IFileVideoDocument>('Video', videoSchema, 'Video');
export { VideoModel };
