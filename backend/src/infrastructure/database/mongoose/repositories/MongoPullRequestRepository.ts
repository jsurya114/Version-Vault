import { injectable } from 'tsyringe';
import { PullRequestModel } from '../models/PullRequestModel';
import { IPullRequestRepository } from '../../../../domain/interfaces/repositories/IPullRequestRepository';
import { PullRequestMapper } from '../../../../application/mappers/PullRequestMapper';
import { MongoBaseRepository } from './MongoBaseRepository';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../../application/dtos/reusable/PaginationDTO';
import { IPullRequest } from '../../../../domain/interfaces/IPullRequest';
@injectable()
export class MongoPullRequestRepository
  extends MongoBaseRepository<IPullRequest>
  implements IPullRequestRepository
{
  constructor() {
    super(PullRequestModel);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected toEntity(doc: any): IPullRequest {
    return PullRequestMapper.toIPullRequest(doc);
  }

  async findByRepo(
    repositoryId: string,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<IPullRequest>> {
    const filter: Record<string, unknown> = { repositoryId };
    if (query.status) filter.status = query.status;
    if (query.search) filter.title = { $regex: query.search, $options: 'i' };
    return this.findWithpagination(filter, query);
  }
}
