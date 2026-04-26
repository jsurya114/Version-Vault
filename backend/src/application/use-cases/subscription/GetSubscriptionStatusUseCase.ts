import { injectable, inject } from 'tsyringe';
import { IGetSubscriptionStatusUseCase } from '../interfaces/subscription/IGetSubscriptionStatusUseCase';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { IPaymentService } from '../../../domain/interfaces/services/IPaymentService';
import { TOKENS } from '../../../shared/constants/tokens';
import { SubscriptionStatusDTO } from '../../../application/dtos/repository/SubscriptionDTO';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { SubscriptionPlan } from '../../../domain/enums';

@injectable()
export class GetSubscriptionStatusUseCase implements IGetSubscriptionStatusUseCase {
  constructor(
    @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
    @inject(TOKENS.IPaymentService) private _paymentService: IPaymentService,
  ) {}

  async execute(userId: string): Promise<SubscriptionStatusDTO> {
    const user = await this._userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    let plan = user.subscriptionPlan;
    let stripeCustomerId = user.stripeCustomerId;
    let stripeSubscriptionId = user.stripeSubscriptionId;

    // Fallback sync for local development where webhooks might not fire
    if (plan === SubscriptionPlan.FREE && user.email) {
      const stripeStatus = await this._paymentService.verifyActiveSubscription(userId, user.email);
      if (stripeStatus.isActive) {
        plan = SubscriptionPlan.PRO;
        stripeCustomerId = stripeStatus.customerId;
        stripeSubscriptionId = stripeStatus.subscriptionId;

        await this._userRepo.update(user.id!, {
          subscriptionPlan: plan,
          stripeCustomerId,
          stripeSubscriptionId,
        } as unknown as Record<string, unknown>);
      }
    }

    return {
      plan,
      isActive: plan === SubscriptionPlan.PRO,
      stripeCustomerId,
      stripeSubscriptionId,
    };
  }
}
