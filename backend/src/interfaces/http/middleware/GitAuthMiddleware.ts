// backend/src/interfaces/http/middleware/GitAuthMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { ITokenService } from '../../../domain/interfaces/services/ITokenService';
import { TOKENS } from '../../../shared/constants/tokens';

export const gitAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers['authorization'];
    console.log('Auth header:', authHeader); // debug

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      res.setHeader('WWW-Authenticate', 'Basic realm="VersionVault"');
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const base64 = authHeader.split(' ')[1];
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');
    console.log('Decoded:', decoded);

    const colonIndex = decoded.indexOf(':');
    const username = decoded.substring(0, colonIndex);
    const token = decoded.substring(colonIndex + 1);
    console.log('Username:', username);
    console.log('Token:', token.substring(0, 20) + '...');

    const tokenService = container.resolve<ITokenService>(TOKENS.ITokenService as any);
    const payload = tokenService.verifyAccessToken(token);
    console.log('Payload:', payload);

    (req as any).user = payload;
    next();
  } catch (error) {
    console.log('Auth error:', error);
    res.setHeader('WWW-Authenticate', 'Basic realm="VersionVault"');
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
