import { injectable, inject } from 'tsyringe';
import { IGetRepoByIdUseCase } from '../interfaces/admin/IGetRepoByIdUseCase';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { TOKENS } from '../../../shared/constants/tokens';
import { RepoResponseDTO } from '../../../application/dtos/repository/RepoResponseDTO';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { RepositoryMapper } from '../../../application/mappers/RepositoryMapper';
import { GitService } from '../../../infrastructure/services/GitService';
import { redisClient } from '../../../infrastructure/Redis/RedisClient';

@injectable()
export class GetRepoByIdUseCase implements IGetRepoByIdUseCase {
  constructor(
    @inject(TOKENS.IRepoRepository) private _repoRepo: IRepoRepository,
    @inject(GitService) private _gitService: GitService,
  ) {}

  async execute(id: string): Promise<RepoResponseDTO> {
    const cacheKey = `admin:repo:${id}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData) as RepoResponseDTO;
    }

    const repo = await this._repoRepo.findById(id);

    if (!repo) throw new NotFoundError('Repository not found');

    const dto = RepositoryMapper.toDTO(repo);

    const [branchCount, storageBytes, languages] = await Promise.all([
      this._gitService.getBranchCount(repo.ownerUsername, repo.name),
      Promise.resolve(this._gitService.getRepoStorageBytes(repo.ownerUsername, repo.name)),
      this._gitService.getLanguageStats(repo.ownerUsername, repo.name, repo.defaultBranch),
    ]);

    dto.branchCount = branchCount;
    dto.storageBytes = storageBytes;
    dto.languages = languages;

    // Cache the fully populated DTO for 5 minutes (300 seconds)
    await redisClient.setex(cacheKey, 300, JSON.stringify(dto));

    return dto;
  }
}
