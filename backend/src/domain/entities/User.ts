import type { IUser } from "../interfaces/IUser";
import type { UserRole,SubscriptionPlan,AuthProvider } from "../enums";

export class User implements IUser {
  readonly id?: string;
  readonly userId: string;
  readonly username: string;
  readonly email: string;
  readonly password?: string;
  readonly avatar?: string;
  readonly bio?: string;
  readonly role: UserRole;
  readonly isVerified: boolean;
  readonly isBlocked: boolean;
  readonly provider: AuthProvider;
  readonly subscriptionPlan: SubscriptionPlan;
  readonly followersCount: number;
  readonly followingCount: number;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: IUser) {
    this.id = props.id;
    this.userId = props.userId;
    this.username = props.username;
    this.email = props.email;
    this.password = props.password;
    this.avatar = props.avatar;
    this.bio = props.bio;
    this.role = props.role;
    this.isVerified = props.isVerified;
    this.isBlocked = props.isBlocked;
    this.provider = props.provider;
    this.subscriptionPlan = props.subscriptionPlan;
    this.followersCount = props.followersCount;
    this.followingCount = props.followingCount;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}