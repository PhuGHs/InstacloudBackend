import mongoose, { model, Model, Schema } from 'mongoose';
import { IPostDocument } from '@post/interfaces/post.interface';

const savedPostSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  username: { type: String },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  createdAt: { type: Date, default: Date.now }
});

const SavedPostModel: Model<IPostDocument> = model<IPostDocument>('SavedPost', savedPostSchema, 'SavedPost');

export { SavedPostModel };
