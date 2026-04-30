"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const ioredis_1 = require("ioredis");
const env_config_1 = require("../../shared/config/env.config");
const Logger_1 = require("../../shared/logger/Logger");
exports.redisClient = new ioredis_1.Redis(env_config_1.envConfig.REDIS_URL);
exports.redisClient.on('connect', () => {
    Logger_1.logger.info('Redis connected successfully');
});
exports.redisClient.on('error', (err) => {
    Logger_1.logger.error('Redis connection error', err);
});
