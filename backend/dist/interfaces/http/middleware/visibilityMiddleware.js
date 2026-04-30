"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visibilityMiddleware = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../shared/constants/tokens");
const visibilityMiddleware = (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;
        if (!token) {
            return next(); // Proceed without req.user for guests
        }
        const tokenService = tsyringe_1.container.resolve(tokens_1.TOKENS.ITokenService);
        const payload = tokenService.verifyAccessToken(token);
        req.user = payload;
        next();
    }
    catch {
        next();
    }
};
exports.visibilityMiddleware = visibilityMiddleware;
