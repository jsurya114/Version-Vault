import { injectable, inject } from 'tsyringe';
import { IGetProfileUseCase } from '../interfaces/user/IGetUserProfileUseCase';
import { TOKENS } from '../../../shared/constants/tokens';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { IUser } from '../../../domain/interfaces/IUser';
import { redisClient } from '../../../infrastructure/Redis/RedisClient';

@injectable()
export class GetProfileUseCase implements IGetProfileUseCase {
  constructor(@inject(TOKENS.IUserRepository) private _userReporitory: IUserRepository) {}

  async execute(userId: string): Promise<IUser> {
    const cacheKey = `user:profile:${userId}`;
    const cachedProfile = await redisClient.get(cacheKey);

    if (cachedProfile) {
      return JSON.parse(cachedProfile) as IUser;
    }

    const user =
      (await this._userReporitory.findByUserId(userId)) ||
      (await this._userReporitory.findByUserName(userId));

    if (!user) {
      throw new Error(`Profile with username '@${userId}' not found`);
    }

    // Cache user profile for 5 minutes (300 seconds)
    await redisClient.setex(cacheKey, 300, JSON.stringify(user));

    return user;
  }
}
