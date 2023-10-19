import { UserModel } from '@user/models/user.schema';
import mongoose from 'mongoose';


class BlockService {
  public async blockUserInDB(userId: string, followerId: string): Promise<void> {
    const first = UserModel.updateOne({
      _id: userId, blocked: { $ne: new mongoose.Types.ObjectId(followerId)},
    }, {
      $push: { blocked: new mongoose.Types.ObjectId(followerId) }
    });

    const second = UserModel.updateOne({
      _id: followerId, blocked: { $ne: new mongoose.Types.ObjectId(userId)},
    }, {
      $push: { blockedBy: new mongoose.Types.ObjectId(userId)}
    });

    await Promise.all([first, second]);
  }

  public async unblockUserInDB(userId: string, followerId: string): Promise<void> {
    const first = UserModel.updateOne({
      _id: userId,
    }, {
      $pull: { blocked: new mongoose.Types.ObjectId(followerId) }
    });

    const second = UserModel.updateOne({
      _id: followerId,
    }, {
      $pull: { blockedBy: new mongoose.Types.ObjectId(userId)}
    });

    await Promise.all([first, second]);
  }
}

export const blockService: BlockService = new BlockService();
