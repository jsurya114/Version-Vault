import mongoose, { Schema, Document } from 'mongoose';

export interface IFollowDocument extends Document {
  followerId: string;
  followerUsername: string;
  followingId: string;
  followingUsername: string;
  createdAt: Date;
}

const FollowSchema = new Schema<IFollowDocument>(
  {
    followerId: { type: String, required: true },
    followerUsername: { type: String, required: true },
    followingId: { type: String, required: true },
    followingUsername: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

export const FollowModel = mongoose.model<IFollowDocument>('Follow', FollowSchema);
