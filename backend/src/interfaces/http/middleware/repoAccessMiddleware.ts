import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { ICollaboratorRepository } from '../../../domain/interfaces/repositories/ICollaboratorRepository';
import { AuthRequest } from '../controllers/repository/RepositoryController';
import { UnauthorizedError } from '../../../domain/errors/UnauthorizedError';

export const repoAccessMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { username, reponame } = req.params;
    const user = (req as unknown as AuthRequest).user;

    const repoRepo = container.resolve<IRepoRepository>(TOKENS.IRepoRepository);
    const collabRepo = container.resolve<ICollaboratorRepository>(TOKENS.ICollaboratorRepository);

    // 1. Check if Repo exists and get it
    const repo = await repoRepo.findByOwnerAndName(username, reponame);
    if (!repo) {
      throw new NotFoundError('Repo not found');
    }

    // 2. Global Block Check
    if (repo.isBlocked) {
      throw new NotFoundError('Repository is currently blocked');
    }

    // 3. Visibility Check logic
    if (repo.visibility === 'private') {
      if (!user) {
        throw new UnauthorizedError('Authentication required for private repo comments');
      }

      const isOwner = repo.ownerId.toString() === user.id;
      if (!isOwner) {
        // If not owner, check if the user is a collaborator
        const collab = await collabRepo.findByRepoAndUser(repo.id!, user.id);
        if (!collab) {
          throw new UnauthorizedError(
            'You do not have permission to access comments on this private repository',
          );
        }
      }
    }

    // 4. Attach the loaded repo to the request so the controllers don't have to query the DB again!
    res.locals.repo = repo;

    next();
  } catch (error) {
    next(error);
  }
};
