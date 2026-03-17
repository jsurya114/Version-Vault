import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from 'src/application/dtos/reusable/PaginationDTO';
import { RepoResponseDTO } from 'src/application/dtos/repository/RepoResponseDTO';

export interface IListRepoUseCase {
  execute(
    ownerId: string,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<RepoResponseDTO>>;
}
