import type { IUser } from "../interfaces/IUser";
import { UserRole,SubscriptionPlan } from "../enums";

export class UserBusinessRules {
  static isActive(user: IUser): boolean {
    return user.isVerified && !user.isBlocked;
  }

  static canUseAiAgent(user: IUser): boolean {
    return user.subscriptionPlan !== SubscriptionPlan.FREE;
  }

  static isAdmin(user: IUser): boolean {
    return user.role === UserRole.ADMIN;
  }
}