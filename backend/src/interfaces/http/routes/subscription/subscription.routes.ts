import { Router, raw } from 'express';
import { container } from 'tsyringe';
import { SubscriptionController } from '../../controllers/subscription/SubscriptionController';
import { authMiddleware } from '../../middleware/AuthMiddleware';
import { AuthRequest } from '../../controllers/repository/RepositoryController';

const router = Router();
const subscriptionController = (): SubscriptionController =>
  container.resolve(SubscriptionController);

// Stripe webhook — MUST use raw body parser, NO auth
router.post('/webhook', raw({ type: 'application/json' }), (req, res, next) =>
  subscriptionController().handleWebhook(req, res, next),
);

// Authenticated routes
router.use(authMiddleware);

router.post('/checkout', (req, res, next) =>
  subscriptionController().createCheckout(req as AuthRequest, res, next),
);

router.post('/cancel', (req, res, next) =>
  subscriptionController().cancelSubscription(req as AuthRequest, res, next),
);

router.get('/status', (req, res, next) =>
  subscriptionController().getStatus(req as AuthRequest, res, next),
);

export default router;
