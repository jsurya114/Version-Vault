export interface IVerifyCheckoutUseCase {
  execute(userId: string, sessionId: string): Promise<void>;
}
