import type { CorsOptions } from 'cors';
import { envConfig } from './env.config';

export const corsOptions: CorsOptions = {
  // Allow only our frontend URL
  origin: envConfig.CLIENT_URL,

  // Allow cookies to be sent with requests
  credentials: true,

  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  // Allowed headers
  allowedHeaders: ['Content-Type', 'Authorization'],
};