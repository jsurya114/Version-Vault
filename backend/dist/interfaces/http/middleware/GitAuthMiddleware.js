"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitAuthMiddleware = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../shared/constants/tokens");
const Logger_1 = require("../../../shared/logger/Logger");
const gitAuthMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        Logger_1.logger.info(`Auth header: ${authHeader}`); // debug
        if (!authHeader || !authHeader.startsWith('Basic ')) {
            res.setHeader('WWW-Authenticate', 'Basic realm="VersionVault"');
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const base64 = authHeader.split(' ')[1];
        const decoded = Buffer.from(base64, 'base64').toString('utf-8');
        const colonIndex = decoded.indexOf(':');
        const username = decoded.substring(0, colonIndex);
        const token = decoded.substring(colonIndex + 1);
        Logger_1.logger.info(`Username: ${username}`);
        Logger_1.logger.info(`Token: ${token.substring(0, 20)}...`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tokenService = tsyringe_1.container.resolve(tokens_1.TOKENS.ITokenService);
        const payload = tokenService.verifyAccessToken(token);
        Logger_1.logger.info(`Payload: ${JSON.stringify(payload)}`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req.user = payload;
        next();
    }
    catch (error) {
        Logger_1.logger.error(`Auth error: ${error}`);
        res.setHeader('WWW-Authenticate', 'Basic realm="VersionVault"');
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};
exports.gitAuthMiddleware = gitAuthMiddleware;
