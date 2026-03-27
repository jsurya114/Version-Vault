import { injectable, inject } from 'tsyringe';
import { IListRepoUseCase } from '../interfaces/repository/IListRepoUseCase';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { TOKENS } from '../../../shared/constants/tokens';

import { RepositoryMapper } from '../../../application/mappers/RepositoryMapper';
import { RepoResponseDTO } from '../../../application/dtos/repository/RepoResponseDTO';
import {
  PaginationQueryDTO,
  PaginatedResponseDTO,
} from '../../../application/dtos/reusable/PaginationDTO';

//for listing users own repositories

@injectable()
export class ListRepoUseCase implements IListRepoUseCase {
  constructor(@inject(TOKENS.IRepoRepository) private repoRepository: IRepoRepository) {}

  async execute(
    ownerId: string,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<RepoResponseDTO>> {
    const result = await this.repoRepository.findByOwner(ownerId, query);

    return {
      data: result.data.map(RepositoryMapper.toDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
