import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { ITokenService } from '../../../domain/interfaces/services/ITokenService';
import { TOKENS } from '../../../shared/constants/tokens';
import { UnauthorizedError } from '../../../domain/errors/UnauthorizedError';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) throw new UnauthorizedError('No access token provided');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokenService = container.resolve<ITokenService>(TOKENS.ITokenService as any);
    const payload = tokenService.verifyAccessToken(token);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).user = payload;
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired access token'));
  }
};
