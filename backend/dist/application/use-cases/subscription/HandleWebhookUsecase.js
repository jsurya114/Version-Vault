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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandleWebhookUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../shared/constants/tokens");
const enums_1 = require("../../../domain/enums");
let HandleWebhookUseCase = class HandleWebhookUseCase {
    _userRepo;
    _paymentService;
    constructor(_userRepo, _paymentService) {
        this._userRepo = _userRepo;
        this._paymentService = _paymentService;
    }
    async execute(payload, signature) {
        try {
            const event = this._paymentService.verifyWebhookSignature(payload, signature);
            switch (event.type) {
                case 'checkout.session.completed': {
                    const session = event.data.object;
                    const userIdMeta = session.metadata?.userId;
                    const subId = typeof session.subscription === 'string'
                        ? session.subscription
                        : session.subscription?.id;
                    const custId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
                    if (!userIdMeta || !subId) {
                        break;
                    }
                    // Try to find user by MongoDB ID or the userId string to be safe
                    const user = await this._userRepo.findById(userIdMeta);
                    const targetId = user ? user.id : userIdMeta;
                    await this._userRepo.update(targetId, {
                        subscriptionPlan: enums_1.SubscriptionPlan.PRO,
                        stripeCustomerId: custId,
                        stripeSubscriptionId: subId,
                    });
                    break;
                }
                case 'customer.subscription.deleted': {
                    const subscription = event.data.object;
                    if (!subscription.id)
                        break;
                    const users = await this._userRepo.find({
                        stripeSubscriptionId: subscription.id,
                    });
                    if (users.length > 0) {
                        await this._userRepo.update(users[0].id, {
                            subscriptionPlan: enums_1.SubscriptionPlan.FREE,
                            stripeSubscriptionId: undefined,
                        });
                    }
                    break;
                }
                case 'invoice.payment_failed': {
                    break;
                }
                default:
                    break;
            }
        }
        catch (error) {
            const err = error;
            console.error(`[Webhook] Error: ${err.message}`);
            throw err;
        }
    }
};
exports.HandleWebhookUseCase = HandleWebhookUseCase;
exports.HandleWebhookUseCase = HandleWebhookUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IUserRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IPaymentService)),
    __metadata("design:paramtypes", [Object, Object])
], HandleWebhookUseCase);
