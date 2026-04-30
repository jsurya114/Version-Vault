import { Redis } from 'ioredis';
import { envConfig } from '../../shared/config/env.config';
import { logger } from '../../shared/logger/Logger';

/**
 * Dedicated Redis connection for BullMQ.
 * BullMQ requires maxRetriesPerRequest to be null for blocking commands.
 * This is separate from the main redisClient used for caching.
 */
export const bullmqConnection = new Redis(envConfig.REDIS_URL, {
  maxRetriesPerRequest: null,
});

bullmqConnection.on('connect', () => {
  logger.info('BullMQ Redis connected successfully');
});

bullmqConnection.on('error', (err) => {
  logger.error('BullMQ Redis connection error', err);
});
