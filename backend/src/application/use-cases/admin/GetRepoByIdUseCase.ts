import { injectable, inject } from 'tsyringe';
import { IGetRepoByIdUseCase } from '../interfaces/admin/IGetRepoByIdUseCase';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { TOKENS } from '../../../shared/constants/tokens';
import { RepoResponseDTO } from '../../../application/dtos/repository/RepoResponseDTO';
import { NotFoundError } from 'src/domain/errors/NotFoundError';
import { RepositoryMapper } from 'src/application/mappers/RepositoryMapper';
import { GitService } from 'src/infrastructure/services/GitService';

@injectable()
export class GetRepoByIdUseCase implements IGetRepoByIdUseCase {
  constructor(
    @inject(TOKENS.IRepoRepository) private _repoRepo: IRepoRepository,
    @inject(GitService) private _gitService: GitService,
  ) {}

  async execute(id: string): Promise<RepoResponseDTO> {
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

    return dto;
  }
}
