import {
  CommentResponseDTO,
  CreateCommentDTO,
} from '../../../../application/dtos/repository/CommentDTO';

export interface ICreateCommentUseCase {
  execute(dto: CreateCommentDTO): Promise<CommentResponseDTO>;
}
