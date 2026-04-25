import { injectable, inject } from 'tsyringe';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { UserResponseDTO } from '../../dtos/admin/UserResponseDTO';
import { IGetStarUseCase } from '../interfaces/repository/IGetStarsUseCase';
import { UserMapper } from '../../../application/mappers/UserMapper';

@injectable()
export class GetStarsUseCase implements IGetStarUseCase {
  constructor(
    @inject(TOKENS.IRepoRepository) private _repoRepo: IRepoRepository,
    @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
  ) {}

  async execute(ownerUsername: string, repoName: string): Promise<UserResponseDTO[]> {
    const repo = await this._repoRepo.findByOwnerAndName(ownerUsername, repoName);
    if (!repo) throw new NotFoundError('Repository not found');

    const starredBy = repo.starredBy || [];
    if (starredBy.length === 0) return [];

    const users = await this._userRepo.findManyByIds(starredBy);
    return users.map((user) => UserMapper.toDTO(user));
  }
}
