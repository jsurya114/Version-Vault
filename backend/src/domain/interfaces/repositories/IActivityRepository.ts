import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../application/dtos/reusable/PaginationDTO';
import { IActivity } from '../IActivity';
import { IBaseRepository } from './IBaseRepository';

export interface IActivityRepository extends IBaseRepository<IActivity> {
  getFeedForUsers(
    followingIds: string[],
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<IActivity>>;
}
