"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBusinessRules = void 0;
const enums_1 = require("../enums");
class UserBusinessRules {
    static isActive(user) {
        return user.isVerified && !user.isBlocked;
    }
    static canUseAiAgent(user) {
        return user.subscriptionPlan !== enums_1.SubscriptionPlan.FREE;
    }
    static isAdmin(user) {
        return user.role === enums_1.UserRole.ADMIN;
    }
}
exports.UserBusinessRules = UserBusinessRules;
