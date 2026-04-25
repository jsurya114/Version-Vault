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
    authenticatedUserId?: string,
  ): Promise<PaginatedResponseDTO<RepoResponseDTO>> {
    let result;

    if (ownerId === authenticatedUserId) {
      // If user is viewing their own list, show owned + collaborated repos
      result = await this.repoRepository.findUserRepositories(ownerId, query);
    } else {
      // If viewing someone else's list, show only their public owned repos
      result = await this.repoRepository.findByOwner(ownerId, query, authenticatedUserId);
    }

    return {
      data: result.data.map(RepositoryMapper.toDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
