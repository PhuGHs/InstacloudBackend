import { IReactionDocument } from '../interfaces/reaction.interface';
import mongoose, { model, Model, Schema } from 'mongoose';

const reactionSchema: Schema = new Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', index: true },
  commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', index: true },
  username: { type: String, default: '' },
  type: { type: String },
  profilePicture: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now() }
});

const ReactionModel: Model<IReactionDocument> = model<IReactionDocument>('Reaction', reactionSchema, 'Reaction');

export { ReactionModel };
