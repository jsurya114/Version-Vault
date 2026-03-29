import winston from 'winston';
import { injectable } from 'tsyringe';
import { ILogger } from '../../domain/interfaces/services/ILogger';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

@injectable()
export class WinstonLogger implements ILogger {
  private _logger: winston.Logger;

  constructor() {
    this._logger = winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat,
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
      ],
    });
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this._logger.info(message, meta);
  }

  error(message: string | Error, error?: unknown, meta?: Record<string, unknown>): void {
    if (message instanceof Error) {
      this._logger.error(message.message, {
        stack: message.stack,
        ...((error as Record<string, unknown>) || {}),
        ...meta,
      });
      return;
    }
    this._logger.error(message as string, { error, ...meta });
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this._logger.warn(message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this._logger.debug(message, meta);
  }
}
