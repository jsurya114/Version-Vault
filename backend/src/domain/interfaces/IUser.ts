import { UserRole, SubscriptionPlan, AuthProvider } from '../enums';

export interface IUser {
  id?: string;
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
  createdAt?: Date;
  updatedAt?: Date;
}
