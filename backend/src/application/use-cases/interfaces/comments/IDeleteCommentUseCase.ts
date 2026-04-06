export interface IDeleteCommentUseCase {
  execute(commentId: string, requestUserId: string): Promise<boolean>;
}
