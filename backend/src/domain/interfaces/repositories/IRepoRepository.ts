import { IRepository } from '../IRepository';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../application/dtos/reusable/PaginationDTO';
import { IBaseRepository } from './IBaseRepository';

export interface IRepoRepository extends IBaseRepository<IRepository> {
  findByOwnerAndName(ownerId: string, name: string): Promise<IRepository | null>;
  findByOwner(
    ownerId: string,
    query: PaginationQueryDTO,
    authenticatedUserId?: string,
  ): Promise<PaginatedResponseDTO<IRepository>>;
  findAll(query: PaginationQueryDTO): Promise<PaginatedResponseDTO<IRepository>>;
  findUserRepositories(
    userId: string,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<IRepository>>;
}
