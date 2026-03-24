import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../../application/dtos/reusable/PaginationDTO';
import { IssuesResponseDTO } from '../../../../application/dtos/repository/IssuesDTO';

export interface IListIssueUseCase {
  execute(
    repositoryId: string,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<IssuesResponseDTO>>;
}
