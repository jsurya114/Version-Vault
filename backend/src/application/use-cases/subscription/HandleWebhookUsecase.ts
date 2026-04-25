import { injectable, inject } from 'tsyringe';
import { IHandleWebhookUseCase } from '../interfaces/subscription/IHandleWebhookUseCase';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { IPaymentService } from '../../../domain/interfaces/services/IPaymentService';
import { TOKENS } from '../../../shared/constants/tokens';
import { SubscriptionPlan } from '../../../domain/enums';

interface StripeEvent {
  type: string;
  data: {
    object: {
      id?: string;
      metadata?: {
        userId?: string;
      };
      subscription?: string | { id: string };
      customer?: string | { id: string };
    };
  };
}

@injectable()
export class HandleWebhookUseCase implements IHandleWebhookUseCase {
  constructor(
    @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
    @inject(TOKENS.IPaymentService) private _paymentService: IPaymentService,
  ) {}
  async execute(payload: Buffer, signature: string): Promise<void> {
    try {
      const event = this._paymentService.verifyWebhookSignature(payload, signature) as StripeEvent;

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const userIdMeta = session.metadata?.userId;
          const subId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription?.id;
          const custId =
            typeof session.customer === 'string' ? session.customer : session.customer?.id;

          if (!userIdMeta || !subId) {
            break;
          }

          // Try to find user by MongoDB ID or the userId string to be safe
          const user = await this._userRepo.findById(userIdMeta);
          const targetId = user ? user.id! : userIdMeta;

          await this._userRepo.update(targetId, {
            subscriptionPlan: SubscriptionPlan.PRO,
            stripeCustomerId: custId,
            stripeSubscriptionId: subId,
          } as unknown as Record<string, unknown>);

          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object;

          if (!subscription.id) break;

          const users = await this._userRepo.find({
            stripeSubscriptionId: subscription.id,
          } as unknown as Record<string, unknown>);

          if (users.length > 0) {
            await this._userRepo.update(users[0].id!, {
              subscriptionPlan: SubscriptionPlan.FREE,
              stripeSubscriptionId: undefined,
            } as unknown as Record<string, unknown>);
          }
          break;
        }

        case 'invoice.payment_failed': {
          break;
        }

        default:
          break;
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error(`[Webhook] Error: ${err.message}`);
      throw err;
    }
  }
}
