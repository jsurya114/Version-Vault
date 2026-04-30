"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const SubscriptionController_1 = require("../../controllers/subscription/SubscriptionController");
const AuthMiddleware_1 = require("../../middleware/AuthMiddleware");
const router = (0, express_1.Router)();
const subscriptionController = () => tsyringe_1.container.resolve(SubscriptionController_1.SubscriptionController);
// Stripe webhook — MUST use raw body parser, NO auth
router.post('/webhook', (0, express_1.raw)({ type: 'application/json' }), (req, res, next) => subscriptionController().handleWebhook(req, res, next));
// Authenticated routes
router.use(AuthMiddleware_1.authMiddleware);
router.post('/checkout', (req, res, next) => subscriptionController().createCheckout(req, res, next));
router.post('/cancel', (req, res, next) => subscriptionController().cancelSubscription(req, res, next));
router.get('/status', (req, res, next) => subscriptionController().getStatus(req, res, next));
exports.default = router;
