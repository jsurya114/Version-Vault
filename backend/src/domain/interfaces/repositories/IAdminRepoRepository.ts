import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../application/dtos/reusable/PaginationDTO';
import { IRepository } from '../IRepository';
import { IBaseRepository } from './IBaseRepository';

export interface IAdminRepoRepository extends IBaseRepository<IRepository> {
  getAllRepos(query: PaginationQueryDTO): Promise<PaginatedResponseDTO<IRepository>>;
  blockRepo(id: string): Promise<IRepository | null>;
  unblockRepo(id: string): Promise<IRepository | null>;
}
