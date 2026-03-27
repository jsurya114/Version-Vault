import { PullRequestResponseDTO } from '../../../../application/dtos/repository/PullRequestDTO';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../../application/dtos/reusable/PaginationDTO';

export interface IListPRUseCase {
  execute(
    repositoryId: string,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<PullRequestResponseDTO>>;
}
