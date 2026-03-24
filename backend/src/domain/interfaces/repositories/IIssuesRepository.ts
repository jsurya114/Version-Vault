import { IIssue } from '../IIssues';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../application/dtos/reusable/PaginationDTO';
import { IBaseRepository } from './IBaseRepository';

export interface IIssueRepository extends IBaseRepository<IIssue> {
  findByRepo(
    repositoryId: string,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<IIssue>>;
}
