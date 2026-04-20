import mongoose, { Schema, Document } from 'mongoose';
export interface INotificationDocument extends Document {
  recipientId: string;
  actorId: string;
  actorUsername: string;
  type: string;
  message: string;
  repositoryId?: string;
  repositoryName?: string;
  metadata?: Record<string, string>;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    recipientId: { type: String, required: true },
    actorId: { type: String, required: true },
    actorUsername: { type: String, required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    repositoryId: { type: String },
    repositoryName: { type: String },
    metadata: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

NotificationSchema.index({ recipientId: 1, createdAt: -1 });
NotificationSchema.index({ recipientId: 1, isRead: 1 });
export const NotificationModel = mongoose.model<INotificationDocument>(
  'Notification',
  NotificationSchema,
);
