"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const tsyringe_1 = require("tsyringe");
const stripe_1 = __importDefault(require("stripe"));
const env_config_1 = require("../../shared/config/env.config");
let StripeService = class StripeService {
    stripe;
    constructor() {
        this.stripe = new stripe_1.default(env_config_1.envConfig.STRIPE_SECRET_KEY);
    }
    async createCheckoutSession(customerId, email, priceId, userId) {
        const session = await this.stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: env_config_1.envConfig.CLIENT_SUBSCRIPTION_SUCCESS_URL,
            cancel_url: env_config_1.envConfig.CLIENT_SUBSCRIPTION_CANCEL_URL,
            metadata: { userId },
            customer: customerId || undefined,
            customer_email: customerId ? undefined : email,
        });
        if (!session.url)
            throw new Error('Stripe did not return a checkout URL');
        return { url: session.url, sessionId: session.id };
    }
    async cancelSubscription(subscriptionId) {
        await this.stripe.subscriptions.cancel(subscriptionId);
    }
    verifyWebhookSignature(payload, signature) {
        return this.stripe.webhooks.constructEvent(payload, signature, env_config_1.envConfig.STRIPE_WEBHOOK_SECRET);
    }
    async verifyActiveSubscription(userId, email) {
        try {
            // Find all customers by email (Stripe allows duplicates)
            const customers = await this.stripe.customers.list({
                email: email.toLowerCase(),
                limit: 10, // Get multiple in case of duplicates
            });
            if (customers.data.length === 0) {
                return { isActive: false };
            }
            // Check each customer for an active subscription
            for (const customer of customers.data) {
                const customerId = customer.id;
                const subscriptions = await this.stripe.subscriptions.list({
                    customer: customerId,
                    status: 'all',
                    limit: 10,
                });
                const activeSub = subscriptions.data.find((sub) => sub.status === 'active' || sub.status === 'trialing');
                if (activeSub) {
                    return {
                        isActive: true,
                        customerId: customerId,
                        subscriptionId: activeSub.id,
                    };
                }
            }
            return { isActive: false };
        }
        catch (error) {
            console.error('Failed to verify active subscription in Stripe:', error);
            return { isActive: false };
        }
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], StripeService);
