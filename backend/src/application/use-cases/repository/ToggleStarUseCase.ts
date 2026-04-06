import { injectable, inject } from 'tsyringe';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { IToggleStarUseCase } from '../interfaces/repository/IToggleStarUseCase';
import { ToggleStarDTO } from '../../../application/dtos/repository/RepoResponseDTO';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { ValidationError } from 'src/domain/errors/ValidationError';

@injectable()
export class ToggleStarUseCase implements IToggleStarUseCase {
  constructor(@inject(TOKENS.IRepoRepository) private _repoRepo: IRepoRepository) {}

  async execute(dto: ToggleStarDTO): Promise<{ isStarred: boolean; starsCount: number }> {
    const repo = await this._repoRepo.findByOwnerAndName(dto.ownerUsername, dto.repoName);
    if (!repo) throw new NotFoundError('Repository not found');

    const starredByArray = repo.starredBy || [];
    const hasStarred = starredByArray.includes(dto.userId);
    if (repo.ownerId === dto.userId) {
      throw new ValidationError('You cannot star your own repository');
    }

    let newStarsCount = repo.stars || 0;
    let newStarredBy = [...starredByArray];

    if (hasStarred) {
      newStarredBy = newStarredBy.filter((id) => id !== dto.userId);
      newStarsCount = Math.max(0, newStarsCount - 1);
    } else {
      newStarredBy.push(dto.userId);
      newStarsCount += 1;
    }
    await this._repoRepo.update(repo.id as string, {
      stars: newStarsCount,
      starredBy: newStarredBy,
    });

    return { isStarred: !hasStarred, starsCount: newStarsCount };
  }
}
