import { CheckoutResponseDTO } from '../../../../application/dtos/repository/SubscriptionDTO';

export interface ICreateCheckoutUseCase {
  execute(userId: string): Promise<CheckoutResponseDTO>;
}
