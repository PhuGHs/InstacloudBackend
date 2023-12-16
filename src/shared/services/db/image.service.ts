import { IFileImageDocument } from '@image/interfaces/image.interface';
import { ImageModel } from '@image/models/image.schema';
import mongoose from 'mongoose';

class ImageService {
  public async addImageToDB(userId: string, imgId: string, imgVersion: string): Promise<void> {
    await ImageModel.create({
      userId,
      imgId,
      imgVersion
    });
  }

  public async getImagesFromDB(userId: string): Promise<IFileImageDocument[]> {
    const images: IFileImageDocument[] = await ImageModel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $sort: { createdAt: -1 } }
    ]);
    return images;
  }

  public async removeImageFromDB(imgId: string): Promise<void> {
    await ImageModel.deleteOne({ _id: imgId });
  }
}

export const imageService: ImageService = new ImageService();
