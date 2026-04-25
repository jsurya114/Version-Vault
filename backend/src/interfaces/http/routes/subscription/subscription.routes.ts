import { Router, raw, Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { SubscriptionController } from '../../controllers/subscription/SubscriptionController';
import { authMiddleware } from '../../middleware/AuthMiddleware';
import { AuthRequest } from '../../controllers/repository/RepositoryController';

const router = Router();
const subscriptionController = (): SubscriptionController =>
  container.resolve(SubscriptionController);

// Stripe webhook — MUST use raw body parser, NO auth
router.post('/webhook', raw({ type: 'application/json' }), (req: Request, res: Response, next: NextFunction) =>
  subscriptionController().handleWebhook(req, res, next),
);

// Authenticated routes
router.use(authMiddleware);

router.post('/checkout', (req: Request, res: Response, next: NextFunction) =>
  subscriptionController().createCheckout(req as AuthRequest, res, next),
);

router.post('/cancel', (req: Request, res: Response, next: NextFunction) =>
  subscriptionController().cancelSubscription(req as AuthRequest, res, next),
);

router.get('/status', (req: Request, res: Response, next: NextFunction) =>
  subscriptionController().getStatus(req as AuthRequest, res, next),
);

export default router;
