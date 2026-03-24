import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { ITokenService } from '../../../domain/interfaces/services/ITokenService';
import { TOKENS } from '../../../shared/constants/tokens';
import { UnauthorizedError } from '../../../domain/errors/UnauthorizedError';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) throw new UnauthorizedError('No access token provided');
    const tokenService = container.resolve<ITokenService>(TOKENS.ITokenService as any);
    const payload = tokenService.verifyAccessToken(token);

    (req as any).user = payload;
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired access token'));
  }
};
