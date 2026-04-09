import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../application/dtos/reusable/PaginationDTO';
import { IChatMessage } from '../IChatMessage';
import { IBaseRepository } from './IBaseRepository';

export interface IChatRepository extends IBaseRepository<IChatMessage> {
  getMessagesByRepositoryId(
    repositoryId: string,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<IChatMessage>>;
}
