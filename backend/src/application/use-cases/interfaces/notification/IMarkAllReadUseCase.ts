export interface IMarkAllReadUseCase {
  execute(recipientId: string): Promise<void>;
}
