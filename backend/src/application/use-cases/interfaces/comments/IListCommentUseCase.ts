import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../../application/dtos/reusable/PaginationDTO';
import { CommentResponseDTO } from '../../../../application/dtos/repository/CommentDTO';

export interface IListCommentUseCase {
  execute(
    targetId: string,
    targetType: 'issue' | 'pr',
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<CommentResponseDTO>>;
}
