import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { IAddCollaboratorUseCase } from '../../../../application/use-cases/interfaces/collaborator/IAddCollaboratorUseCase';
import { IRemoveCollaboratorUseCase } from '../../../../application/use-cases/interfaces/collaborator/IRemoveCollaboratorUseCase';
import { IGetCollaboratorUseCase } from '../../../../application/use-cases/interfaces/collaborator/IGetCollaboratorUseCase';
import { IUpdateCollaboratorUseCase } from '../../../../application/use-cases/interfaces/collaborator/IUpdateCollaboratorUseCase';
import { ICheckCollaboratorUseCase } from '../../../../application/use-cases/interfaces/collaborator/ICheckCollaboratorUseCase';
import { IRepoRepository } from '../../../../domain/interfaces/repositories/IRepoRepository';
import { IUserRepository } from '../../../../domain/interfaces/repositories/IUserRepository';
import { ITokenPayload } from '../../../../domain/interfaces/services/ITokenService';
import { HttpStatusCodes } from '../../../../shared/constants/HttpStatusCodes';
import { TOKENS } from '../../../../shared/constants/tokens';

export interface AuthRequest extends Request {
  user: ITokenPayload;
}

@injectable()
export class CollaboratorController {
  constructor(
    @inject(TOKENS.IAddCollaboratorUseCase) private _addCollab: IAddCollaboratorUseCase,
    @inject(TOKENS.IRemoveCollaboratorUseCase) private _removeCollab: IRemoveCollaboratorUseCase,
    @inject(TOKENS.IGetCollaboratorUseCase) private _getCollab: IGetCollaboratorUseCase,
    @inject(TOKENS.IUpdateCollaboratorUseCase) private _updateCollab: IUpdateCollaboratorUseCase,
    @inject(TOKENS.ICheckCollaboratorUseCase) private _checkCollab: ICheckCollaboratorUseCase,
    @inject(TOKENS.IRepoRepository) private _repoRepo: IRepoRepository,
    @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
  ) {}

  // POST /vv/collaborators/:username/:reponame

  async addCollaborator(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: ownerId, userId: ownerUsername } = req.user;
      const { reponame } = req.params;
      const { collaboratorUsername, role } = req.body;

      const repo = await this._repoRepo.findByOwnerAndName(ownerId, reponame);
      if (!repo) {
        res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({ success: false, message: 'Repository not found' });
        return;
      }

      if (repo.ownerId !== ownerId) {
        res
          .status(HttpStatusCodes.FORBIDDEN)
          .json({ success: false, message: 'Only the owner can manage collaborators' });
        return;
      }

      await this._addCollab.execute(
        ownerId,
        ownerUsername,
        repo.id!,
        repo.name,
        collaboratorUsername,
        role || 'read',
      );

      res.status(HttpStatusCodes.CREATED).json({
        success: true,
        message: `${collaboratorUsername} added as collaborator`,
      });
    } catch (error) {
      next(error);
    }
  }
  // DELETE /vv/collaborators/:username/:reponame/:collaboratorUsername
  async removeCollaborator(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: ownerId } = req.user;
      const { reponame, collaboratorUsername } = req.params;
      const repo = await this._repoRepo.findByOwnerAndName(ownerId, reponame);
      if (!repo) {
        res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({ success: false, message: 'Repository not found' });
        return;
      }
      if (repo.ownerId !== ownerId) {
        res
          .status(HttpStatusCodes.FORBIDDEN)
          .json({ success: false, message: 'Only the owner can manage collaborators' });
        return;
      }

      const targetUser = await this._userRepo.findByUserId(collaboratorUsername);
      if (!targetUser) {
        res.status(HttpStatusCodes.NOT_FOUND).json({ success: false, message: 'User not found' });
        return;
      }
      await this._removeCollab.execute(ownerId, repo.id!, targetUser.id!);

      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: `${collaboratorUsername} removed from collaborators`,
      });
    } catch (error) {}
  }

  // GET /vv/collaborators/:username/:reponame
  async getCollaborators(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, reponame } = req.params;
      const owner = await this._userRepo.findById(username);
      if (!owner) {
        res.status(HttpStatusCodes.NOT_FOUND).json({ success: false, message: 'User not found' });
        return;
      }

      const repo = await this._repoRepo.findByOwnerAndName(owner.id!, reponame);
      if (!repo) {
        res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({ success: false, message: 'Repository not found' });
        return;
      }

      const collaborators = await this._getCollab.execute(repo.id!);

      res.status(HttpStatusCodes.OK).json({ success: true, data: collaborators });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /vv/collaborators/:username/:reponame/:collaboratorUsername
  async updateRole(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: ownerId } = req.user;
      const { reponame, collaboratorUsername } = req.params;
      const { role } = req.body;
      const repo = await this._repoRepo.findByOwnerAndName(ownerId, reponame);
      if (!repo) {
        res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({ success: false, message: 'Repository not found' });
        return;
      }

      if (repo.ownerId !== ownerId) {
        res
          .status(HttpStatusCodes.FORBIDDEN)
          .json({ success: false, message: 'Only the owner can manage collaborators' });
        return;
      }

      const targetUser = await this._userRepo.findByUserId(collaboratorUsername);
      if (!targetUser) {
        res.status(HttpStatusCodes.NOT_FOUND).json({ success: false, message: 'User not found' });
        return;
      }

      const updated = await this._updateCollab.execute(ownerId, repo.id!, targetUser.id!, role);

      res.status(HttpStatusCodes.OK).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  // GET /vv/collaborators/:username/:reponame/check
  async checkAccess(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: userId } = req.user;
      const { username, reponame } = req.params;
      const owner = await this._userRepo.findByUserId(username);

      if (!owner) {
        res.status(HttpStatusCodes.NOT_FOUND).json({ success: false, message: 'User not found' });
        return;
      }

      const repo = await this._repoRepo.findByOwnerAndName(owner.id!, reponame);
      if (!repo) {
        res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({ success: false, message: 'Repository not found' });
        return;
      }

      if (repo.ownerId === userId) {
        res
          .status(HttpStatusCodes.OK)
          .json({ success: true, data: { hasAccess: true, role: 'owner' } });
        return;
      }

      const isCollab = await this._checkCollab.execute(repo.id!, userId);
      res.status(HttpStatusCodes.OK).json({
        success: true,
        data: { hasAccess: isCollab, role: isCollab ? 'collaborator' : null },
      });
    } catch (error) {
      next(error);
    }
  }
}
