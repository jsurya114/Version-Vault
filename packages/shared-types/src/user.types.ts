import { UserRole, SubscriptionPlan } from './enums';

export interface IUser {
  id: string;
  userId: string;
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  isVerified: boolean;
  isBlocked: boolean;
  subscriptionPlan: SubscriptionPlan;
  followersCount: number;
  followingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserProfile extends IUser {
  repositories: number;
  contributions: number;
}