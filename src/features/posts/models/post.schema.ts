import mongoose, { model, Model, Schema } from 'mongoose';
import { IPostDocument } from '@post/interfaces/post.interface';
import { ReactionModel } from '@reaction/models/reaction.schema';
import { CommentsModel } from '@comment/models/comment.schema';

const postSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  username: { type: String },
  email: { type: String },
  profilePicture: { type: String },
  post: { type: String, default: '' },
  imgVersion: { type: String, default: '' },
  pId: { type: String },
  imgId: { type: String, default: '' },
  videoVersion: { type: String, default: '' },
  videoId: { type: String, default: '' },
  feelings: { type: String, default: '' },
  gifUrl: { type: String, default: '' },
  privacy: { type: String, default: '' },
  commentsCount: { type: Number, default: 0 },
  reactions: {
    like: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

postSchema.pre('deleteOne', async function (next: () => void) {
  const doc = await this.model.findOne(this.getQuery());
  if(doc) {
    await ReactionModel.deleteMany({ postId: doc._id });
    await CommentsModel.deleteMany({ postId: doc._id });
  }
  next();
});

const PostModel: Model<IPostDocument> = model<IPostDocument>('Post', postSchema, 'Post');

export { PostModel };
