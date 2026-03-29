import { injectable, inject } from 'tsyringe';
import { IUnblockRepoUseCase } from '../interfaces/admin/IUnblockRepoUseCase';
import { IAdminRepoRepository } from '../../../domain/interfaces/repositories/IAdminRepoRepository';
import { RepoResponseDTO } from '../../../application/dtos/repository/RepoResponseDTO';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { RepositoryMapper } from 'src/application/mappers/RepositoryMapper';

@injectable()
export class UnblockRepoUseCase implements IUnblockRepoUseCase {
  constructor(@inject(TOKENS.IAdminRepoRepository) private _adminRepo: IAdminRepoRepository) {}

  async execute(id: string): Promise<RepoResponseDTO> {
    const repo = await this._adminRepo.unblockRepo(id);

    if (!repo) throw new NotFoundError('Repository not found');

    return RepositoryMapper.toDTO(repo);
  }
}
