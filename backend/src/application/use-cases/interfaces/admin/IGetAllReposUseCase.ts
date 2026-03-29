import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../../application/dtos/reusable/PaginationDTO';
import { RepoResponseDTO } from '../../../../application/dtos/repository/RepoResponseDTO';

export interface IGetAllRepoUseCase {
  execute(query: PaginationQueryDTO): Promise<PaginatedResponseDTO<RepoResponseDTO>>;
}
