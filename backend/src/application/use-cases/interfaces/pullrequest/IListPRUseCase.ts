import { PRStatus } from '../../../../domain/interfaces/IPullRequest';
import { PullRequestResponseDTO } from '../../../../application/dtos/repository/PullRequestDTO';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../../application/dtos/reusable/PaginationDTO';

export interface IListPRUseCase {
  execute(
    repositoryId: string,
    query: PaginationQueryDTO<PRStatus>,
  ): Promise<PaginatedResponseDTO<PullRequestResponseDTO>>;
}
