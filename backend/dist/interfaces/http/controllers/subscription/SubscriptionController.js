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
exports.SubscriptionController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../../shared/constants/tokens");
const HttpStatusCodes_1 = require("../../../../shared/constants/HttpStatusCodes");
let SubscriptionController = class SubscriptionController {
    _createCheckout;
    _handleWebhook;
    _cancelSubscription;
    _getStatus;
    constructor(_createCheckout, _handleWebhook, _cancelSubscription, _getStatus) {
        this._createCheckout = _createCheckout;
        this._handleWebhook = _handleWebhook;
        this._cancelSubscription = _cancelSubscription;
        this._getStatus = _getStatus;
    }
    async createCheckout(req, res, next) {
        try {
            const { id: userId } = req.user;
            const result = await this._createCheckout.execute(userId);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    async handleWebhook(req, res, next) {
        try {
            const signature = req.headers['stripe-signature'];
            await this._handleWebhook.execute(req.body, signature);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ received: true });
        }
        catch (error) {
            next(error);
        }
    }
    async cancelSubscription(req, res, next) {
        try {
            const { id: userId } = req.user;
            await this._cancelSubscription.execute(userId);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, message: 'Subscription cancelled' });
        }
        catch (error) {
            next(error);
        }
    }
    async getStatus(req, res, next) {
        try {
            const { id: userId } = req.user;
            const result = await this._getStatus.execute(userId);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
};
exports.SubscriptionController = SubscriptionController;
exports.SubscriptionController = SubscriptionController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.ICreateCheckoutUseCase)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IHandleWebhookUseCase)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.ICancelSubscriptionUseCase)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetSubscriptionStatusUseCase)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], SubscriptionController);
