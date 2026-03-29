import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../../application/dtos/reusable/PaginationDTO';
import { RepoResponseDTO } from '../../../../application/dtos/repository/RepoResponseDTO';

export interface IListRepoUseCase {
  execute(
    ownerId: string,
    query: PaginationQueryDTO,
    authenticatedUserId?: string,
  ): Promise<PaginatedResponseDTO<RepoResponseDTO>>;
}
