import { IBaseRepository } from './IBaseRepository';
import { IComment } from '../IComment';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../application/dtos/reusable/PaginationDTO';

export interface ICommentRepository extends IBaseRepository<IComment> {
  findByTargetId(
    targetId: string,
    targetType: 'issue' | 'pr',
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<IComment>>;
  deleteManyByTargetId(targetId: string, targetType: 'issue' | 'pr'): Promise<void>;
}
