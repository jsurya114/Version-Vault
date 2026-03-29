import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../../../domain/errors/UnauthorizedError';

export const ownerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authenticatedUser = (req as Request & { user: { userId: string } }).user?.userId;
  const repoOwner = req.params.username;

  if (authenticatedUser !== repoOwner) {
    return next(
      new UnauthorizedError('Access denied: Only the repository owner can perform this action.'),
    );
  }
  next();
};
