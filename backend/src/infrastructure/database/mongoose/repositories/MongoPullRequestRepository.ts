import { injectable } from 'tsyringe';
import { PullRequestModel } from '../models/PullRequestModel';
import { IPullRequestRepository } from 'src/domain/interfaces/repositories/IPullRequestRepository';
import { PullRequestMapper } from 'src/application/mappers/PullRequestMapper';
import { MongoBaseRepository } from './MongoBaseRepository';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from 'src/application/dtos/reusable/PaginationDTO';
import { IPullRequest } from 'src/domain/interfaces/IPullRequest';
@injectable()
export class MongoPullRequestRepository
  extends MongoBaseRepository<IPullRequest>
  implements IPullRequestRepository
{
  constructor() {
    super(PullRequestModel);
  }

  protected toEntity(doc: any): IPullRequest {
    return PullRequestMapper.toIPullRequest(doc);
  }

  async findByRepo(
    repositoryId: string,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<IPullRequest>> {
    const filter: Record<string, any> = { repositoryId };
    if (query.status) filter.status = query.status;
    if (query.search) filter.title = { $regex: query.search, $options: 'i' };
    return this.findWithpagination(filter, query);
  }
}
