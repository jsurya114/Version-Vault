"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ownerMiddleware = void 0;
const UnauthorizedError_1 = require("../../../domain/errors/UnauthorizedError");
const ownerMiddleware = (req, res, next) => {
    const authenticatedUser = req.user?.userId;
    const repoOwner = req.params.username;
    if (authenticatedUser !== repoOwner) {
        return next(new UnauthorizedError_1.UnauthorizedError('Access denied: Only the repository owner can perform this action.'));
    }
    next();
};
exports.ownerMiddleware = ownerMiddleware;
