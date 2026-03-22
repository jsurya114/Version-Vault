import { injectable, inject } from 'tsyringe';
import { IListPRUseCase } from '../interfaces/pullrequest/IListPRUseCase';
import { IPullRequestRepository } from 'src/domain/interfaces/repositories/IPullRequestRepository';
import { PullRequestMapper } from 'src/application/mappers/PullRequestMapper';
import { PullRequestResponseDTO } from 'src/application/dtos/repository/PullRequestDTO';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from 'src/application/dtos/reusable/PaginationDTO';
import { TOKENS } from 'src/shared/constants/tokens';

@injectable()
export class ListPRUseCase implements IListPRUseCase {
  constructor(
    @inject(TOKENS.IPullRequestRepository) private listPrUseCase: IPullRequestRepository,
  ) {}

  async execute(
    repositoryId: string,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<PullRequestResponseDTO>> {
    const result = await this.listPrUseCase.findByRepo(repositoryId, query);
    return {
      data: result.data.map(PullRequestMapper.toDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
