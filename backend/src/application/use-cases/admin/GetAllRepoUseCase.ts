import { injectable, inject } from 'tsyringe';
import { IAdminRepoRepository } from '../../../domain/interfaces/repositories/IAdminRepoRepository';
import { IGetAllRepoUseCase } from '../interfaces/admin/IGetAllReposUseCase';
import { TOKENS } from '../../../shared/constants/tokens';
import { RepoResponseDTO } from '../../../application/dtos/repository/RepoResponseDTO';
import {
  PaginationQueryDTO,
  PaginatedResponseDTO,
} from 'src/application/dtos/reusable/PaginationDTO';
import { RepositoryMapper } from 'src/application/mappers/RepositoryMapper';

@injectable()
export class GetAllRepoUseCase implements IGetAllRepoUseCase {
  constructor(@inject(TOKENS.IAdminRepoRepository) private _adminRepo: IAdminRepoRepository) {}

  async execute(query: PaginationQueryDTO): Promise<PaginatedResponseDTO<RepoResponseDTO>> {
    const result = await this._adminRepo.getAllRepos(query);
    return {
      ...result,
      data: result.data.map((repo) => RepositoryMapper.toDTO(repo)),
    };
  }
}
