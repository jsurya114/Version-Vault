import { injectable, inject } from 'tsyringe';
import { ICreateRepoUseCase } from '../interfaces/repository/ICreateRepoUseCase';
import { IRepoRepository } from 'src/domain/interfaces/repositories/IRepoRepository';
import { RepoResponseDTO } from 'src/application/dtos/repository/RepoResponseDTO';
import { TOKENS } from 'src/shared/constants/tokens';
import { ConflictError } from 'src/domain/errors/ConflictError';
import { RepositoryVisibility } from 'src/domain/enums';
import { CreateRepoDTO } from 'src/application/dtos/repository/CreateRepoDTO';
import { RepositoryMapper } from 'src/application/mappers/RepositoryMapper';
import { GitService } from 'src/infrastructure/services/GitService';

@injectable()
export class CreateRepoUseCase implements ICreateRepoUseCase {
  constructor(
    @inject(TOKENS.IRepoRepository) private repoRepository: IRepoRepository,
    @inject(GitService) private gitService: GitService,
  ) {}

  async execute(dto: CreateRepoDTO): Promise<RepoResponseDTO> {
    //check the repository exists
    const existing = await this.repoRepository.findByOwnerAndName(dto.ownerId, dto.name);

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
      isDeleted: false,
    });

    //initialize base repo on disk
    await this.gitService.initBareRepo(dto.ownerUsername, dto.name);

    return RepositoryMapper.toDTO(repo);
  }
}
