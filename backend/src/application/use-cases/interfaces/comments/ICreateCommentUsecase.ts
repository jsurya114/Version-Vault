import { CommentResponseDTO, CreateCommentDTO } from 'src/application/dtos/repository/CommentDTO';

export interface ICreateCommentUseCase {
  execute(dto: CreateCommentDTO): Promise<CommentResponseDTO>;
}
