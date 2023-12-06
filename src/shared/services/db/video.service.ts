import { IFileVideoDocument } from '@video/interfaces/video.interface';
import { VideoModel } from '@video/models/video.schema';

class VideoService {
  public async getVideos(userId: string): Promise<IFileVideoDocument[]> {
    const videos: IFileVideoDocument[] = await VideoModel.find({ userId }, { createdAt: -1 }).exec();
    return videos;
  }

  public async removeVideo(videoId: string, videoVersion: string): Promise<void> {
    await VideoModel.deleteOne({ videoId, videoVersion});
  }

  public async addVideo(data: IFileVideoDocument): Promise<void> {
    const video: IFileVideoDocument = {
      userId: data.userId,
      videoId: data.videoId,
      videoVersion: data.videoVersion,
      createdAt: new Date()
    } as IFileVideoDocument;
    await VideoModel.create(video);
  }
}

export const videoService: VideoService = new VideoService();
