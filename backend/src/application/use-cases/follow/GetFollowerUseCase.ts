import { injectable, inject } from 'tsyringe';
import { IGetFollowersUseCase } from '../interfaces/follow/IGetFollowersUseCase';
import { IFollowRepository } from '../../../domain/interfaces/repositories/IFollowRepository';
import { IFollow } from '../../../domain/interfaces/IFollow';
import { TOKENS } from '../../../shared/constants/tokens';

@injectable()
export class GetFollowersUseCase implements IGetFollowersUseCase {
  constructor(@inject(TOKENS.IFollowRepository) private _followRepo: IFollowRepository) {}

  async execute(userId: string): Promise<IFollow[]> {
    return this._followRepo.findFollowers(userId);
  }
}
