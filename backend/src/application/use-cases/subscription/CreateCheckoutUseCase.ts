import { injectable, inject } from 'tsyringe';
import { ICreateCheckoutUseCase } from '../interfaces/subscription/ICreateCheckoutUseCase';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { IPaymentService } from '../../../domain/interfaces/services/IPaymentService';
import { TOKENS } from '../../../shared/constants/tokens';
import { envConfig } from '../../../shared/config/env.config';
import { CheckoutResponseDTO } from 'src/application/dtos/repository/SubscriptionDTO';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { ConflictError } from '../../../domain/errors/ConflictError';
import { SubscriptionPlan } from '../../../domain/enums';

@injectable()
export class CreateCheckoutUseCase implements ICreateCheckoutUseCase {
  constructor(
    @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
    @inject(TOKENS.IPaymentService) private _paymentService: IPaymentService,
  ) {}

  async execute(userId: string): Promise<CheckoutResponseDTO> {
    const user = await this._userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    if (user.subscriptionPlan === SubscriptionPlan.PRO) {
      throw new ConflictError('User already has an active PRO subscription');
    }
    const { url, sessionId } = await this._paymentService.createCheckoutSession(
      user.stripeCustomerId,
      user.email,
      envConfig.STRIPE_PRO_PRICE_ID,
      user.id!,
    );

    return { url, sessionId };
  }
}
