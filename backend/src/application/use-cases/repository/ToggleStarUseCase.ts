import { injectable, inject } from 'tsyringe';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { IToggleStarUseCase } from '../interfaces/repository/IToggleStarUseCase';
import { IRecordActivityUseCase } from '../interfaces/activity/IRecordActivityUseCase';
import { ToggleStarDTO } from '../../../application/dtos/repository/RepoResponseDTO';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { NotificationService } from '../../../infrastructure/services/NotificationService';

@injectable()
export class ToggleStarUseCase implements IToggleStarUseCase {
  constructor(
    @inject(TOKENS.IRepoRepository) private _repoRepo: IRepoRepository,
    @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
    @inject(TOKENS.NotificationService) private _notificationService: NotificationService,
    @inject(TOKENS.IRecordActivityUseCase) private _recordActivityUseCase: IRecordActivityUseCase,
  ) {}

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

    // Only notify on star (not unstar)
    if (!hasStarred) {
      const actor = await this._userRepo.findById(dto.userId);
      const actorUsername = actor?.username || 'Someone';

      this._notificationService
        .notifyUser({
          recipientId: repo.ownerId,
          actorId: dto.userId,
          actorUsername,
          type: 'repo_starred',
          message: `${actorUsername} starred your repository "${repo.name}"`,
          repositoryId: repo.id as string,
          repositoryName: repo.name,
        })
        .catch(() => {});

      this._recordActivityUseCase
        .execute({
          actorId: dto.userId,
          actorUsername,
          actorAvatar: actor?.avatar,
          isPrivate: repo.visibility === 'private',
          actionType: 'starred_repo',
          targetId: repo.id as string,
          targetName: `${dto.ownerUsername}/${repo.name}`,
        })
        .catch(() => {});
    }

    return { isStarred: !hasStarred, starsCount: newStarsCount };
  }
}
