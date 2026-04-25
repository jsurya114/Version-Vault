import { injectable, inject } from 'tsyringe';
import { IGetSubscriptionStatusUseCase } from '../interfaces/subscription/IGetSubscriptionStatusUseCase';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { TOKENS } from '../../../shared/constants/tokens';
import { SubscriptionStatusDTO } from '../../../application/dtos/repository/SubscriptionDTO';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { SubscriptionPlan } from '../../../domain/enums';

@injectable()
export class GetSubscriptionStatusUseCase implements IGetSubscriptionStatusUseCase {
  constructor(@inject(TOKENS.IUserRepository) private _userRepo: IUserRepository) {}

  async execute(userId: string): Promise<SubscriptionStatusDTO> {
    const user = await this._userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return {
      plan: user.subscriptionPlan,
      isActive: user.subscriptionPlan === SubscriptionPlan.PRO,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
    };
  }
}
