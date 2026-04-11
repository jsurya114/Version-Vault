import { IPullRequest, PRStatus } from '../IPullRequest';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../application/dtos/reusable/PaginationDTO';
import { IBaseRepository } from './IBaseRepository';

export interface IPullRequestRepository extends IBaseRepository<IPullRequest> {
  findByRepo(
    repositoryId: string,
    query: PaginationQueryDTO<PRStatus>,
  ): Promise<PaginatedResponseDTO<IPullRequest>>;
  existOpenPR(repositoryId: string, sourceBranch: string, targetBranch: string): Promise<boolean>;
  findLatestOpenPR(
    repositoryId: string,
    sourceBranch: string,
    targetBranch: string,
  ): Promise<IPullRequest | null>;
  countPRsByRepo(repositoryId: string): Promise<number>;
}
