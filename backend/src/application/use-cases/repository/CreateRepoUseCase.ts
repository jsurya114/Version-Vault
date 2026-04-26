import { injectable, inject } from 'tsyringe';
import { ICreateRepoUseCase } from '../interfaces/repository/ICreateRepoUseCase';
import { IRecordActivityUseCase } from '../interfaces/activity/IRecordActivityUseCase';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { RepoResponseDTO } from '../../../application/dtos/repository/RepoResponseDTO';
import { TOKENS } from '../../../shared/constants/tokens';
import { ConflictError } from '../../../domain/errors/ConflictError';
import { RepositoryVisibility } from '../../../domain/enums';
import { CreateRepoDTO } from '../../../application/dtos/repository/CreateRepoDTO';
import { RepositoryMapper } from '../../../application/mappers/RepositoryMapper';
import { GitService } from '../../../infrastructure/services/GitService';

@injectable()
export class CreateRepoUseCase implements ICreateRepoUseCase {
  constructor(
    @inject(TOKENS.IRepoRepository) private repoRepository: IRepoRepository,
    @inject(TOKENS.IUserRepository) private userRepository: IUserRepository,
    @inject(GitService) private gitService: GitService,
    @inject(TOKENS.IRecordActivityUseCase) private _recordActivityUseCase: IRecordActivityUseCase,
  ) {}

  async execute(dto: CreateRepoDTO): Promise<RepoResponseDTO> {
    //check the repository exists
    const existing = await this.repoRepository.findByOwnerAndName(dto.ownerUsername, dto.name);

    if (existing) throw new ConflictError('Repository with this name already exists');

    const repo = await this.repoRepository.save({
      name: dto.name,
      description: dto.description,
      visibility: dto.visibility as RepositoryVisibility,
      ownerId: dto.ownerId,
      ownerUsername: dto.ownerUsername,
      defaultBranch: 'main',
      stars: 0,
      forks: 0,
      size: 0,
      isBlocked: false,
      isDeleted: false,
    });

    //initialize base repo on disk
    await this.gitService.initBareRepo(dto.ownerUsername, dto.name);

    const actor = await this.userRepository.findById(dto.ownerId);

    this._recordActivityUseCase
      .execute({
        actorId: dto.ownerId,
        actorUsername: dto.ownerUsername,
        actorAvatar: actor?.avatar,
        isPrivate: dto.visibility === 'private',
        actionType: 'created_repo',
        targetId: repo.id as string,
        targetName: repo.name,
      })
      .catch(() => {});

    return RepositoryMapper.toDTO(repo);
  }
}
