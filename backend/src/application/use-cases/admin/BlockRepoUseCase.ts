import { injectable, inject } from 'tsyringe';
import { IBlockRepoUseCase } from '../interfaces/admin/IBlockRepoUseCase';
import { IAdminRepoRepository } from '../../../domain/interfaces/repositories/IAdminRepoRepository';
import { RepoResponseDTO } from '../../../application/dtos/repository/RepoResponseDTO';
import { TOKENS } from '../../..//shared/constants/tokens';
import { RepositoryMapper } from '../../../application/mappers/RepositoryMapper';
import { NotFoundError } from '../../../domain/errors/NotFoundError';

@injectable()
export class BlockRepoUseCase implements IBlockRepoUseCase {
  constructor(@inject(TOKENS.IAdminRepoRepository) private _adminRepo: IAdminRepoRepository) {}

  async execute(id: string): Promise<RepoResponseDTO> {
    const repo = await this._adminRepo.blockRepo(id);
    if (!repo) throw new NotFoundError('Repo not found');

    return RepositoryMapper.toDTO(repo);
  }
}
