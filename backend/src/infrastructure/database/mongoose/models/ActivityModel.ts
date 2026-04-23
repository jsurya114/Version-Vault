import mongoose, { Schema, Document } from 'mongoose';
import { ActivityActionType } from '../../../../domain/interfaces/IActivity';

export interface IActivityDocument extends Document {
  actorId: string;
  actorUsername: string;
  isPrivate: boolean;
  actorAvatar?: string;
  actionType: ActivityActionType;
  targetId: string;
  targetName: string;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivityDocument>(
  {
    actorId: { type: String, required: true },
    actorUsername: { type: String, required: true },
    isPrivate: { type: Boolean, default: false },
    actorAvatar: { type: String },
    actionType: { type: String, required: true },
    targetId: { type: String, required: true },
    targetName: { type: String, required: true },
  },
  { timestamps: true },
);

// Index for fast feed queries
ActivitySchema.index({ actorId: 1, createdAt: -1 });

export const ActivityModel = mongoose.model<IActivityDocument>('Activity', ActivitySchema);
