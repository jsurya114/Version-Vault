import mongoose, { Schema, Document } from 'mongoose';
import { UserRole, SubscriptionPlan, AuthProvider } from '../../../../domain/enums';

export interface IUserDocument extends Document {
  userId: string;
  username: string;
  email: string;
  password?: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  isVerified: boolean;
  isBlocked: boolean;
  provider: AuthProvider;
  subscriptionPlan: SubscriptionPlan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  followersCount: number;
  followingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    userId: { type: String, required: true, unique: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    avatar: { type: String },
    bio: { type: String },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    provider: { type: String, enum: Object.values(AuthProvider), default: AuthProvider.LOCAL },
    subscriptionPlan: {
      type: String,
      enum: Object.values(SubscriptionPlan),
      default: SubscriptionPlan.FREE,
    },
    stripeCustomerId: { type: String, default: null },
    stripeSubscriptionId: { type: String, default: null },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
