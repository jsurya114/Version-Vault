import { container } from 'tsyringe';
import { TOKENS } from '../constants/tokens';
import { ILogger } from '../../domain/interfaces/services/ILogger';

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) =>
    container.resolve<ILogger>(TOKENS.ILogger).info(message, meta),
  error: (message: unknown, error?: unknown, meta?: Record<string, unknown>) =>
    container.resolve<ILogger>(TOKENS.ILogger).error(message, error, meta),
  warn: (message: string, meta?: Record<string, unknown>) =>
    container.resolve<ILogger>(TOKENS.ILogger).warn(message, meta),
  debug: (message: string, meta?: Record<string, unknown>) =>
    container.resolve<ILogger>(TOKENS.ILogger).debug(message, meta),
};
