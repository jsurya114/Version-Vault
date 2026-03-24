import { injectable } from 'tsyringe';
import { IIssue } from '../../../../domain/interfaces/IIssues';
import { IIssueRepository } from '../../../../domain/interfaces/repositories/IIssuesRepository';
import { IssueMapper } from '../../../../application/mappers/IssuesMapper';
import { IssueModel } from '../models/IssuesModel';
import { MongoBaseRepository } from './MongoBaseRepository';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../../application/dtos/reusable/PaginationDTO';

@injectable()
export class MongoIssuesRepository extends MongoBaseRepository<IIssue> implements IIssueRepository {
  constructor() {
    super(IssueModel);
  }

  protected toEntity(doc: any): IIssue {
    return IssueMapper.toIIssues(doc);
  }
  async findByRepo(
    repositoryId: string,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<IIssue>> {
    const filter: Record<string, any> = { repositoryId };
    if (query.status) filter.status = query.status;
    if (query.search) filter.title = { $regex: query.search, $options: 'i' };
    return this.findWithpagination(filter, query);
  }
}
