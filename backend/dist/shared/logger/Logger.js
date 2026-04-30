"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../constants/tokens");
exports.logger = {
    info: (message, meta) => tsyringe_1.container.resolve(tokens_1.TOKENS.ILogger).info(message, meta),
    error: (message, error, meta) => tsyringe_1.container.resolve(tokens_1.TOKENS.ILogger).error(message, error, meta),
    warn: (message, meta) => tsyringe_1.container.resolve(tokens_1.TOKENS.ILogger).warn(message, meta),
    debug: (message, meta) => tsyringe_1.container.resolve(tokens_1.TOKENS.ILogger).debug(message, meta),
};
