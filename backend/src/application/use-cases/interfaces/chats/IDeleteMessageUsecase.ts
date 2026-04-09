export interface IDeleteMessageUseCase {
  execute(messageId: string, userId: string): Promise<boolean>;
}
