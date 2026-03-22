import { PullRequestResponseDTO } from 'src/application/dtos/repository/PullRequestDTO';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from 'src/application/dtos/reusable/PaginationDTO';

export interface IListPRUseCase {
  execute(
    repositoryId: string,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<PullRequestResponseDTO>>;
}
