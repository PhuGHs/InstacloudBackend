import mongoose, { model, Model, Schema } from 'mongoose';
import { ICommentDocument } from '@comment/interfaces/comment.interface';
import { ReactionModel } from '@reaction/models/reaction.schema';

const commentSchema: Schema = new Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', index: true },
  comment: { type: String, default: '' },
  username: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  profilePicture: { type: String },
  reactions: {
    like: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now() }
});

commentSchema.pre('deleteOne', async function (next: () => void) {
  const doc = await this.model.findOne(this.getQuery());
  await ReactionModel.deleteMany({ commentId: doc._id });
  next();
});

commentSchema.pre('deleteMany', async function (next: () => void) {
  const deletedDocs = await this.model.find(this.getQuery());
  const commentIds = deletedDocs.map((item) => item._id);
  await ReactionModel.deleteMany({ commentId: { $in: commentIds } });
  next();
});

const CommentsModel: Model<ICommentDocument> = model<ICommentDocument>('Comment', commentSchema, 'Comment');
export { CommentsModel };
