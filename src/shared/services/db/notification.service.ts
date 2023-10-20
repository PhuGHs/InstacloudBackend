import { INotificationDocument } from '@notification/interfaces/notification.interface';
import { NotificationModel } from '@notification/models/notification.schema';
import mongoose from 'mongoose';


class NotificationService {
  public async getNotification(userId: string): Promise<INotificationDocument[]> {
    const notification = await NotificationModel.aggregate([
      { $match: { userTo: new mongoose.Types.ObjectId(userId )}},
      { $sort: { createdAt: - 1 }}
    ]);
    return notification;
  }

  public async markNotificationAsSeen(notificationId: string): Promise<void> {
    await NotificationModel.updateOne({ _id: notificationId }, { $set: { read: true }});
  }
}

export const notificationService: NotificationService = new NotificationService();
