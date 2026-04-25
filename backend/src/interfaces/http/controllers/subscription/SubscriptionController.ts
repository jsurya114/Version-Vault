import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { TOKENS } from '../../../../shared/constants/tokens';
import { HttpStatusCodes } from '../../../../shared/constants/HttpStatusCodes';
import { ICreateCheckoutUseCase } from '../../../../application/use-cases/interfaces/subscription/ICreateCheckoutUseCase';
import { IHandleWebhookUseCase } from '../../../../application/use-cases/interfaces/subscription/IHandleWebhookUseCase';
import { ICancelSubscriptionUseCase } from '../../../../application/use-cases/interfaces/subscription/ICancelSubscriptionUseCase';
import { IGetSubscriptionStatusUseCase } from '../../../../application/use-cases/interfaces/subscription/IGetSubscriptionStatusUseCase';
import { AuthRequest } from '../repository/RepositoryController';

@injectable()
export class SubscriptionController {
  constructor(
    @inject(TOKENS.ICreateCheckoutUseCase)
    private _createCheckout: ICreateCheckoutUseCase,
    @inject(TOKENS.IHandleWebhookUseCase)
    private _handleWebhook: IHandleWebhookUseCase,
    @inject(TOKENS.ICancelSubscriptionUseCase)
    private _cancelSubscription: ICancelSubscriptionUseCase,
    @inject(TOKENS.IGetSubscriptionStatusUseCase)
    private _getStatus: IGetSubscriptionStatusUseCase,
  ) {}
  async createCheckout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: userId } = req.user;
      const result = await this._createCheckout.execute(userId);
      res.status(HttpStatusCodes.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;
      await this._handleWebhook.execute(req.body, signature);
      res.status(HttpStatusCodes.OK).json({ received: true });
    } catch (error) {
      next(error);
    }
  }
  async cancelSubscription(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: userId } = req.user;
      await this._cancelSubscription.execute(userId);
      res.status(HttpStatusCodes.OK).json({ success: true, message: 'Subscription cancelled' });
    } catch (error) {
      next(error);
    }
  }
  async getStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: userId } = req.user;
      const result = await this._getStatus.execute(userId);
      res.status(HttpStatusCodes.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
