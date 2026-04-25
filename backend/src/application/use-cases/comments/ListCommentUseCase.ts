import { injectable, inject } from 'tsyringe';
import { IListCommentUseCase } from '../interfaces/comments/IListCommentUseCase';
import { CommentResponseDTO } from '../../../application/dtos/repository/CommentDTO';

import { ICommentRepository } from '../../../domain/interfaces/repositories/ICommentRepository';
import { TOKENS } from '../../../shared/constants/tokens';
import { CommentMapper } from '../../../application/mappers/CommentMapper';
import {
  PaginationQueryDTO,
  PaginatedResponseDTO,
} from '../../../application/dtos/reusable/PaginationDTO';

@injectable()
export class ListCommentUseCase implements IListCommentUseCase {
  constructor(@inject(TOKENS.ICommentRepository) private _commentRepo: ICommentRepository) {}

  async execute(
    targetId: string,
    targetType: 'issue' | 'pr',
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<CommentResponseDTO>> {
    const result = await this._commentRepo.findByTargetId(targetId, targetType, query);
    return {
      ...result,
      data: result.data.map(CommentMapper.toResponseDTO),
    };
  }
}
