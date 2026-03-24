import { injectable, inject } from 'tsyringe';
import { IGetFollowingUseCase } from '../interfaces/follow/IGetFollowingUseCase';
import { IFollowRepository } from '../../../domain/interfaces/repositories/IFollowRepository';
import { IFollow } from '../../../domain/interfaces/IFollow';

import { TOKENS } from '../../../shared/constants/tokens';

@injectable()
export class GetFollowingUseCase implements IGetFollowingUseCase {
  constructor(@inject(TOKENS.IFollowRepository) private _followRepo: IFollowRepository) {}

  async execute(userId: string): Promise<IFollow[]> {
    return this._followRepo.findFollowing(userId);
  }
}
