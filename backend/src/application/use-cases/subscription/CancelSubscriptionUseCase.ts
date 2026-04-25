import { injectable, inject } from 'tsyringe';
import { ICancelSubscriptionUseCase } from '../interfaces/subscription/ICancelSubscriptionUseCase';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { IPaymentService } from '../../../domain/interfaces/services/IPaymentService';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { ConflictError } from '../../../domain/errors/ConflictError';
import { SubscriptionPlan } from '../../../domain/enums';

@injectable()
export class CancelSubscriptionUseCase implements ICancelSubscriptionUseCase {
  constructor(
    @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
    @inject(TOKENS.IPaymentService) private _paymentService: IPaymentService,
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this._userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    if (!user.stripeSubscriptionId) {
      throw new ConflictError('No active subscription to cancel');
    }
    await this._paymentService.cancelSubscription(user.stripeSubscriptionId);
    await this._userRepo.update(userId, {
      subscriptionPlan: SubscriptionPlan.FREE,
      stripeSubscriptionId: undefined,
    });
  }
}
