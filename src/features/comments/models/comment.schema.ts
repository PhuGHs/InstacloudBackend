import mongoose, { model, Model, Schema } from 'mongoose';
import { ICommentDocument } from '@comment/interfaces/comment.interface';

const commentSchema: Schema = new Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', index: true },
  comment: { type: String, default: '' },
  username: { type: String },
  firstname: { type: String },
  lastname: { type: String },
  profilePicture: { type: String },
  reactions: {
    like: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now() }
});

const CommentsModel: Model<ICommentDocument> = model<ICommentDocument>('Comment', commentSchema, 'Comment');
export { CommentsModel };
