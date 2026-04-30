"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bullmqConnection = void 0;
const ioredis_1 = require("ioredis");
const env_config_1 = require("../../shared/config/env.config");
const Logger_1 = require("../../shared/logger/Logger");
/**
 * Dedicated Redis connection for BullMQ.
 * BullMQ requires maxRetriesPerRequest to be null for blocking commands.
 * This is separate from the main redisClient used for caching.
 */
exports.bullmqConnection = new ioredis_1.Redis(env_config_1.envConfig.REDIS_URL, {
    maxRetriesPerRequest: null,
});
exports.bullmqConnection.on('connect', () => {
    Logger_1.logger.info('BullMQ Redis connected successfully');
});
exports.bullmqConnection.on('error', (err) => {
    Logger_1.logger.error('BullMQ Redis connection error', err);
});
