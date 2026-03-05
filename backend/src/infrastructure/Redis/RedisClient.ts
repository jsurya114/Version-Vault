import { Redis } from 'ioredis';
import { envConfig } from '../../shared/config/env.config';
import { logger } from '../../shared/logger/Logger';

export const redisClient = new Redis(envConfig.REDIS_URL);

redisClient.on('connect', () => {
  logger.info('Redis connected successfully');
});

redisClient.on('error', (err) => {
  logger.error('Redis connection error', err);
});