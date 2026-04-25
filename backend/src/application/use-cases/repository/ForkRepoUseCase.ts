import { injectable, inject } from 'tsyringe';
import { IForkRepoUseCase } from '../interfaces/repository/IForkRepoUseCase';
import { IRecordActivityUseCase } from '../interfaces/activity/IRecordActivityUseCase';
import { ForkRepoDTO } from '../../../application/dtos/repository/ForkDTO';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { ICollaboratorRepository } from '../../../domain/interfaces/repositories/ICollaboratorRepository';
import { RepoResponseDTO } from '../../../application/dtos/repository/RepoResponseDTO';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { ConflictError } from '../../../domain/errors/ConflictError';
import { RepositoryMapper } from '../../../application/mappers/RepositoryMapper';
import { RepositoryVisibility } from '../../../domain/enums';
import { GitService } from '../../../infrastructure/services/GitService';
import { UnauthorizedError } from '../../../domain/errors/UnauthorizedError';
import { NotificationService } from '../../../infrastructure/services/NotificationService';

@injectable()
export class ForkRepoUseCase implements IForkRepoUseCase {
  constructor(
    @inject(TOKENS.IRepoRepository) private _repoRepo: IRepoRepository,
    @inject(TOKENS.ICollaboratorRepository) private _collabRepo: ICollaboratorRepository,
    @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
    @inject(GitService) private _gitService: GitService,
    @inject(TOKENS.NotificationService) private _notificationService: NotificationService,
    @inject(TOKENS.IRecordActivityUseCase) private _recordActivityUseCase: IRecordActivityUseCase,
  ) {}

  async execute(dto: ForkRepoDTO): Promise<RepoResponseDTO> {
    //verify source reository exists
    const sourceRepo = await this._repoRepo.findByOwnerAndName(
      dto.sourceOwnerUsername,
      dto.sourceRepoName,
    );

    if (!sourceRepo || sourceRepo.isDeleted || sourceRepo.isBlocked) {
      throw new NotFoundError('Source Repository is not found');
    }
    //validate permission must be public or user must be collaborator/owner
    const isOwner = sourceRepo.ownerId.toString() === dto.forkerId;
    let isCollaborator = false;

    if (!isOwner) {
      const collab = await this._collabRepo.findByRepoAndUser(
        sourceRepo.id as string,
        dto.forkerId,
      );
      if (collab) isCollaborator = true;
    }

    if (sourceRepo.visibility === RepositoryVisibility.PRIVATE && !isOwner && !isCollaborator) {
      throw new UnauthorizedError('You do not have permission to fork this repository');
    }

    //ensure the user doesnt already have a repo with the exact same name
    const existingFork = await this._repoRepo.findByOwnerAndName(
      dto.forkerUsername,
      sourceRepo.name,
    );
    if (existingFork) {
      throw new ConflictError('You already have a repository wiht this name');
    }
    const forkRepo = await this._repoRepo.save({
      name: sourceRepo.name,
      description: sourceRepo.description,
      visibility: sourceRepo.visibility,
      ownerId: dto.forkerId,
      ownerUsername: dto.forkerUsername,
      defaultBranch: sourceRepo.defaultBranch || 'main',
      stars: 0,
      forks: 0,
      size: sourceRepo.size,
      isBlocked: false,
      isDeleted: false,
      isFork: true,
      parentRepoId: sourceRepo.id as string,
      parentRepoOwnerUsername: sourceRepo.ownerUsername,
    });

    await this._gitService.forkBareRepo(
      dto.sourceOwnerUsername,
      dto.sourceRepoName,
      dto.forkerUsername,
      dto.sourceRepoName,
    );

    await this._repoRepo.update(sourceRepo.id as string, {
      forks: (sourceRepo.forks || 0) + 1,
    });

    this._notificationService
      .notifyUser({
        recipientId: sourceRepo.ownerId,
        actorId: dto.forkerId,
        actorUsername: dto.forkerUsername,
        type: 'repo_forked',
        message: `${dto.forkerUsername} forked your repository "${sourceRepo.name}"`,
        repositoryId: sourceRepo.id as string,
        repositoryName: sourceRepo.name,
      })
      .catch(() => {});

    const forker = await this._userRepo.findById(dto.forkerId);

    this._recordActivityUseCase
      .execute({
        actorId: dto.forkerId,
        actorUsername: dto.forkerUsername,
        actorAvatar: forker?.avatar,
        isPrivate: forkRepo.visibility === RepositoryVisibility.PRIVATE,
        actionType: 'forked_repo',
        targetId: forkRepo.id as string,
        targetName: forkRepo.name,
      })
      .catch(() => {});

    return RepositoryMapper.toDTO(forkRepo);
  }
}
