import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../../application/dtos/reusable/PaginationDTO';
import { IActivity } from '../../../../domain/interfaces/IActivity';
export interface IGetActivityFeedUseCase {
  execute(userId: string, query: PaginationQueryDTO): Promise<PaginatedResponseDTO<IActivity>>;
}
