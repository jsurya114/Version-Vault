import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from 'src/application/dtos/reusable/PaginationDTO';
import { IssuesResponseDTO } from 'src/application/dtos/repository/IssuesDTO';

export interface IListIssueUseCase {
  execute(
    repositoryId: string,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<IssuesResponseDTO>>;
}
