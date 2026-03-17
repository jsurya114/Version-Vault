import { injectable, inject } from 'tsyringe';
import { IListRepoUseCase } from '../interfaces/repository/IListRepoUseCase';
import { IRepoRepository } from 'src/domain/interfaces/repositories/IRepoRepository';
import { TOKENS } from 'src/shared/constants/tokens';
import { NotFoundError } from 'src/domain/errors/NotFoundError';
import { RepositoryMapper } from 'src/application/mappers/RepositoryMapper';
import { RepoResponseDTO } from 'src/application/dtos/repository/RepoResponseDTO';
import {
  PaginationQueryDTO,
  PaginatedResponseDTO,
} from 'src/application/dtos/reusable/PaginationDTO';

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
