import { IPullRequest } from '../IPullRequest';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../application/dtos/reusable/PaginationDTO';
import { IBaseRepository } from './IBaseRepository';

export interface IPullRequestRepository extends IBaseRepository<IPullRequest> {
  findByRepo(
    repositoryId: string,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<IPullRequest>>;
  existOpenPR(repositoryId: string, sourceBranch: string, targetBranch: string): Promise<boolean>;
}
