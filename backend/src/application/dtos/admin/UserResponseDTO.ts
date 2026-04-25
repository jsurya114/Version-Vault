export interface UserResponseDTO {
  id: string;
  userId: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: string;
  isVerified: boolean;
  isBlocked: boolean;
  provider: string;
  subscriptionPlan: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  followersCount: number;
  followingCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}
