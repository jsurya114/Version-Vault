"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../shared/constants/tokens");
const UnauthorizedError_1 = require("../../../domain/errors/UnauthorizedError");
const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;
        if (!token)
            throw new UnauthorizedError_1.UnauthorizedError('No access token provided');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tokenService = tsyringe_1.container.resolve(tokens_1.TOKENS.ITokenService);
        const payload = tokenService.verifyAccessToken(token);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req.user = payload;
        next();
    }
    catch {
        next(new UnauthorizedError_1.UnauthorizedError('Invalid or expired access token'));
    }
};
exports.authMiddleware = authMiddleware;
