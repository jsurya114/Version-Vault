// backend/src/interfaces/http/middleware/GitAuthMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../../../shared/logger/Logger';
import { container } from 'tsyringe';
import { ITokenService } from '../../../domain/interfaces/services/ITokenService';
import { TOKENS } from '../../../shared/constants/tokens';

export const gitAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers['authorization'];
    logger.info(`Auth header: ${authHeader}`); // debug

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      res.setHeader('WWW-Authenticate', 'Basic realm="VersionVault"');
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const base64 = authHeader.split(' ')[1];
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');

    const colonIndex = decoded.indexOf(':');
    const username = decoded.substring(0, colonIndex);
    const token = decoded.substring(colonIndex + 1);
    logger.info(`Username: ${username}`);
    logger.info(`Token: ${token.substring(0, 20)}...`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokenService = container.resolve<ITokenService>(TOKENS.ITokenService as any);
    const payload = tokenService.verifyAccessToken(token);
    logger.info(`Payload: ${JSON.stringify(payload)}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).user = payload;
    next();
  } catch (error) {
    logger.error(`Auth error: ${error}`);
    res.setHeader('WWW-Authenticate', 'Basic realm="VersionVault"');
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
