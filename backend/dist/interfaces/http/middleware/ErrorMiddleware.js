"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const DomainError_1 = require("../../../domain/errors/DomainError");
const Logger_1 = require("../../../shared/logger/Logger");
const errorMiddleware = (err, req, res, _next) => {
    Logger_1.logger.error(`${req.method} ${req.path} — ${err.message}`);
    if (err instanceof DomainError_1.DomainError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }
    res.status(500).json({
        success: false,
        message: 'Internal server error',
    });
};
exports.errorMiddleware = errorMiddleware;
