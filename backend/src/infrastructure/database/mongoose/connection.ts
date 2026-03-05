import mongoose from "mongoose";
import { envConfig } from "src/shared/config/env.config";
import { logger } from "src/shared/logger/Logger";

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(envConfig.MONGODB_URI);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection failed', error);
    throw error;
  }
};