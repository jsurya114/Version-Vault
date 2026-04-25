import { SubscriptionStatusDTO } from '../../../dtos/repository/SubscriptionDTO';

export interface IGetSubscriptionStatusUseCase {
  execute(userId: string): Promise<SubscriptionStatusDTO>;
}
