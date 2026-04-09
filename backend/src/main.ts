import 'reflect-metadata';
import './container';
import app from './app';
import http from 'http'
import { envConfig } from './shared/config/env.config';
import { logger } from './shared/logger/Logger';
import { connectDatabase } from './infrastructure/database/mongoose/connection';
import {container} from 'tsyringe'
import { SocketService } from './infrastructure/services/SocketService';
import { TOKENS } from './shared/constants/tokens';

const startSever = async (): Promise<void> => {
  try {
    await connectDatabase();

    const server = http.createServer(app)
    container.registerInstance(TOKENS.HttpServer,server)

   const socketService = container.resolve(SocketService)

    //starting the server
    server.listen(envConfig.PORT, () => {
      logger.info(`Server running on port ${envConfig.PORT} in ${envConfig.NODE_ENV} mode`);
    });

    
   
    
  } catch (error) {
    console.error("CRASH ERROR:", error);
    process.exit(1);
  }
};
startSever();
