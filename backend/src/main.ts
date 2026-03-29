import 'reflect-metadata';
import './container';
import app from './app';
import { envConfig } from './shared/config/env.config';
import { logger } from './shared/logger/Logger';
import { connectDatabase } from './infrastructure/database/mongoose/connection';

const startSever = async (): Promise<void> => {
  try {
    await connectDatabase();

    //starting the server
    app.listen(envConfig.PORT, () => {
      logger.info(`Server running on port ${envConfig.PORT} in ${envConfig.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};
startSever();
