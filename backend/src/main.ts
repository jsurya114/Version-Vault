import 'reflect-metadata';
import './container';
import app from './app';
import http from 'http';
import { envConfig } from './shared/config/env.config';
import { logger } from './shared/logger/Logger';
import { connectDatabase } from './infrastructure/database/mongoose/connection';
import { container } from 'tsyringe';

import { TOKENS } from './shared/constants/tokens';
import { cicdWorker } from './infrastructure/workers/CICDWorker';

const startSever = async (): Promise<void> => {
  try {
    await connectDatabase();

    const server = http.createServer(app);
    container.registerInstance(TOKENS.HttpServer, server);

    container.resolve(TOKENS.ISocketEmitter);

    // Start CI/CD background worker
    cicdWorker.on('completed', (job) => {
      logger.info(`[CI/CD] Job ${job.id} completed`);
    });
    cicdWorker.on('failed', (job, err) => {
      logger.error(`[CI/CD] Job ${job?.id} failed: ${err.message}`);
    });
    logger.info('[CI/CD] Worker started and listening for jobs');

    //starting the server
    server.listen(envConfig.PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${envConfig.PORT} in ${envConfig.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error('CRASH ERROR:', error);
    process.exit(1);
  }
};
startSever();
