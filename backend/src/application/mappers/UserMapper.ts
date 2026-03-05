import { IUser } from "src/domain/interfaces/IUser";

export class UserMapper{
    static toIUser(doc:any):IUser{
        return{
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
      followersCount: doc.followersCount,
      followingCount: doc.followingCount,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
        }
    }
}