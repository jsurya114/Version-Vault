import { injectable, inject } from 'tsyringe';
import { IssueMapper } from '../mappers/IssuesMapper';
import { IListIssueUseCase } from '../use-cases/interfaces/issues/IListIssueUseCase';
import { IIssueRepository } from '../../domain/interfaces/repositories/IIssuesRepository';
import { IssuesResponseDTO } from '../dtos/repository/IssuesDTO';
import { PaginatedResponseDTO, PaginationQueryDTO } from '../dtos/reusable/PaginationDTO';
import { TOKENS } from '../../shared/constants/tokens';

@injectable()
export class ListIssueUseCase implements IListIssueUseCase {
  constructor(@inject(TOKENS.IIssuesRepository) private _issuRepo: IIssueRepository) {}

  async execute(
    repositoryId: string,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<IssuesResponseDTO>> {
    const result = await this._issuRepo.findByRepo(repositoryId, query);
    return {
      data: result.data.map(IssueMapper.toDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
