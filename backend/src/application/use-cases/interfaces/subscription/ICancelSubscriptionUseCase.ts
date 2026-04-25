export interface ICancelSubscriptionUseCase {
  execute(userId: string): Promise<void>;
}
