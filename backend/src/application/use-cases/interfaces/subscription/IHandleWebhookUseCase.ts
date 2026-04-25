export interface IHandleWebhookUseCase {
  execute(payload: Buffer, signature: string): Promise<void>;
}
