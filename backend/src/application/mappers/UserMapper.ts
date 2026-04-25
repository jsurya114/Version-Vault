import { IUser } from '../../domain/interfaces/IUser';
import { UserResponseDTO } from '../dtos/admin/UserResponseDTO';

export class UserMapper {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static toIUser(doc: any): IUser {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      username: doc.username,
      email: doc.email,
      password: doc.password,
      avatar: doc.avatar,
      bio: doc.bio,
      role: doc.role,
      isVerified: doc.isVerified,
      isBlocked: doc.isBlocked,
      provider: doc.provider,
      subscriptionPlan: doc.subscriptionPlan,
      stripeCustomerId: doc.stripeCustomerId,
      stripeSubscriptionId: doc.stripeSubscriptionId,
      followersCount: doc.followersCount,
      followingCount: doc.followingCount,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static toDTO(user: IUser): UserResponseDTO {
    return {
      id: user.id as string,
      userId: user.userId,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      isVerified: user.isVerified,
      isBlocked: user.isBlocked,
      provider: user.provider,
      subscriptionPlan: user.subscriptionPlan,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
