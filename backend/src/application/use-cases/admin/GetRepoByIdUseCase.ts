import { injectable, inject } from 'tsyringe';
import { IGetRepoByIdUseCase } from '../interfaces/admin/IGetRepoByIdUseCase';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { TOKENS } from '../../../shared/constants/tokens';
import { RepoResponseDTO } from '../../../application/dtos/repository/RepoResponseDTO';
import { NotFoundError } from 'src/domain/errors/NotFoundError';
import { RepositoryMapper } from 'src/application/mappers/RepositoryMapper';

@injectable()
export class GetRepoByIdUseCase implements IGetRepoByIdUseCase {
  constructor(@inject(TOKENS.IRepoRepository) private _repoRepo: IRepoRepository) {}

  async execute(id: string): Promise<RepoResponseDTO> {
    const repo = await this._repoRepo.findById(id);

    if (!repo) throw new NotFoundError('Repository not found');

    return RepositoryMapper.toDTO(repo);
  }
}
