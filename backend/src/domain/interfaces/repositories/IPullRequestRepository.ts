import { IPullRequest } from '../IPullRequest';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from 'src/application/dtos/reusable/PaginationDTO';
import { IBaseRepository } from './IBaseRepository';

export interface IPullRequestRepository extends IBaseRepository<IPullRequest> {
  findByRepo(
    repositoryId: string,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<IPullRequest>>;
}
