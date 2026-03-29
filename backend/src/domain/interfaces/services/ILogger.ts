export interface ILogger {
  info(message: string, meta?: Record<string, unknown>): void;
  error(message: string | unknown, error?: unknown, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}
