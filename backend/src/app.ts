import 'reflect-metadata';
import express, { RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { corsOptions } from './shared/config/cors.config';
import { envConfig } from './shared/config/env.config';
import { errorMiddleware } from './interfaces/http/middleware/ErrorMiddleware';
import { logger } from './shared/logger/Logger';

//routes
import authRoutes from './interfaces/http/routes/user/auth.routes';

const app = express();

//security middlewares
app.use(helmet());
app.use(cors(corsOptions));

//request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(envConfig.COOKIE_SECRET as string) as RequestHandler);

//logger
app.use(
  morgan('dev', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }),
);

app.get('/running', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Version Vault API is running',
  });
});

//api routes
app.use('/vv/auth', authRoutes);

//error hanlding middleware
app.use(errorMiddleware);

export default app;
