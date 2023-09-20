import { compare, hash } from 'bcryptjs';
import mongoose, { Model, Schema } from 'mongoose';
import { IAuthDocument } from '../interfaces/auth.interface';

const SALT_ROUND = 10;

const authSchema: Schema = new Schema(
  {
    username: {type: String },
    firstname: {type: String },
    lastname: {type: String },
    uId: {type: Number },
    email: {type: String },
    password: {type: String },
    createdAt: {type: Date, default: Date.now },
    passwordResetToken: {type: String, default: ''},
    passwordResetExpires: {type: Number}
  },
  {
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      }
    },
    methods: {
      async comparePasswords(password: string): Promise<boolean> {
        const hashedPassword: string = this.password!;
        return compare(password, hashedPassword);
      },
      async hashPasswords(password: string): Promise<string> {
        return hash(password, SALT_ROUND);
      }
    }
  },
);

authSchema.pre('save', async function (this: IAuthDocument, next: () => void) {
  const hashedPassword: string = await hash(this.password!, SALT_ROUND);
  this.password = hashedPassword;
  next();
});

export const AuthModel: Model<IAuthDocument> = mongoose.model<IAuthDocument>('Auth', authSchema, 'Auth');
