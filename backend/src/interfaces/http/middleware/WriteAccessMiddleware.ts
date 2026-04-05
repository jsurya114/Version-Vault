import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { UnauthorizedError } from '../../../domain/errors/UnauthorizedError';
import { ICollaboratorRepository } from '../../../domain/interfaces/repositories/ICollaboratorRepository';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { TOKENS } from '../../../shared/constants/tokens';
import { AuthRequest } from '../controllers/repository/RepositoryController';

export const writeAccessMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = (req as unknown as AuthRequest).user;

    const { username, reponame } = req.params;
    //onwer always has acess
    if (user?.userId === username) {
      return next();
    }

    //check if user is a collaborator with write or admin role
    const repoRepo = container.resolve<IRepoRepository>(TOKENS.IRepoRepository);
    const collabRepo = container.resolve<ICollaboratorRepository>(TOKENS.ICollaboratorRepository);
    const repo = await repoRepo.findByOwnerAndName(username, reponame);
    if (!repo) {
      return next(new UnauthorizedError('Repository not found'));
    }
    const collab = await collabRepo.findByRepoAndUser(repo.id!, user?.id);
    if (collab && (collab.role === 'write' || collab.role === 'admin')) {
      return next();
    }
    return next(
      new UnauthorizedError('Access denied: You need write access to perform this action.'),
    );
  } catch (error) {
    next(error);
  }
};
