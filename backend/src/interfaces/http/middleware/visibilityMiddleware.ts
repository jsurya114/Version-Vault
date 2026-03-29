import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { ITokenService } from '../../../domain/interfaces/services/ITokenService';
import { TOKENS } from '../../../shared/constants/tokens';
import { AuthRequest } from '../controllers/repository/RepositoryController';

export const visibilityMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      return next(); // Proceed without req.user for guests
    }
    const tokenService = container.resolve<ITokenService>(TOKENS.ITokenService);
    const payload = tokenService.verifyAccessToken(token);

    (req as unknown as AuthRequest).user = payload;
    next();
  } catch {
    next();
  }
};
