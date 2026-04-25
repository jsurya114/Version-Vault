import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { IAddCollaboratorUseCase } from '../../../../application/use-cases/interfaces/collaborator/IAddCollaboratorUseCase';
import { IRemoveCollaboratorUseCase } from '../../../../application/use-cases/interfaces/collaborator/IRemoveCollaboratorUseCase';
import { IGetCollaboratorUseCase } from '../../../../application/use-cases/interfaces/collaborator/IGetCollaboratorUseCase';
import { IUpdateCollaboratorUseCase } from '../../../../application/use-cases/interfaces/collaborator/IUpdateCollaboratorUseCase';
import { ICheckCollaboratorUseCase } from '../../../../application/use-cases/interfaces/collaborator/ICheckCollaboratorUseCase';
import { ISendInvitationUseCase } from '../../../../application/use-cases/interfaces/collaborator/ISendInvitationUseCase';
import { IAcceptInvitationUseCase } from '../../../../application/use-cases/interfaces/collaborator/IAcceptInvitationUseCase';
import { IDeclineInvitationUseCase } from '../../../../application/use-cases/interfaces/collaborator/IDeclineInvitationUseCase';
import { IGetPendingInvitationsUseCase } from '../../../../application/use-cases/interfaces/collaborator/IGetPendingInvitationsUseCase';
import { IGetInvitationByTokenUseCase } from '../../../../application/use-cases/interfaces/collaborator/IGetInvitationByTokenUseCase';
import { IRepoRepository } from '../../../../domain/interfaces/repositories/IRepoRepository';
import { IUserRepository } from '../../../../domain/interfaces/repositories/IUserRepository';
import { IInvitationRepository } from '../../../../domain/interfaces/repositories/IInvitationRepository';
import { ITokenPayload } from '../../../../domain/interfaces/services/ITokenService';
import { HttpStatusCodes } from '../../../../shared/constants/HttpStatusCodes';
import { TOKENS } from '../../../../shared/constants/tokens';
import { IGetAllCollabsUseCase } from '../../../../application/use-cases/interfaces/collaborator/IGetAllCollabsUseCase';

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
    @inject(TOKENS.ISendInvitationUseCase) private _sendInvitation: ISendInvitationUseCase,
    @inject(TOKENS.IAcceptInvitationUseCase) private _acceptInvitation: IAcceptInvitationUseCase,
    @inject(TOKENS.IDeclineInvitationUseCase) private _declineInvitation: IDeclineInvitationUseCase,
    @inject(TOKENS.IGetInvitationByTokenUseCase)
    private _getInvitationByToken: IGetInvitationByTokenUseCase,
    @inject(TOKENS.IGetPendingInvitationsUseCase)
    private _getPendingInvitations: IGetPendingInvitationsUseCase,
    @inject(TOKENS.IGetAllCollabsUseCase) private _getAllCollabs: IGetAllCollabsUseCase,
    @inject(TOKENS.IRepoRepository) private _repoRepo: IRepoRepository,
    @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
    @inject(TOKENS.IInvitationRepository) private _inviteRepo: IInvitationRepository,
  ) {}

  // POST /vv/collaborators/:username/:reponame/invite
  async sendInvitation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: ownerId, userId: ownerUsername } = req.user;
      const { username, reponame } = req.params;
      const { inviteeEmail, role } = req.body;

      const repo = await this._repoRepo.findByOwnerAndName(username, reponame);
      if (!repo) {
        res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({ success: false, message: 'Repository not found' });
        return;
      }
      if (repo.ownerId !== ownerId) {
        res
          .status(HttpStatusCodes.FORBIDDEN)
          .json({ success: false, message: 'Only the owner can send invitations' });
        return;
      }

      const invitation = await this._sendInvitation.execute(
        ownerId,
        ownerUsername,
        repo.id!,
        repo.name,
        inviteeEmail,
        role || 'read',
      );

      res
        .status(HttpStatusCodes.CREATED)
        .json({ success: true, message: `Invitation sent to ${inviteeEmail}`, data: invitation });
    } catch (error) {
      next(error);
    }
  }

  // GET /vv/collaborators/invitation/:token
  async getInvitationByToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      const invitation = await this._getInvitationByToken.execute(token);
      res.status(HttpStatusCodes.OK).json({ success: true, data: invitation });
    } catch (error) {
      next(error);
    }
  }

  // POST /vv/collaborators/invitation/:token/accept
  async acceptInvitation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      const { id: userId, email: userEmail, userId: username } = req.user;
      await this._acceptInvitation.execute(token, userId, userEmail, username);
      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: 'Invitation accepted. You are now a collaborator.',
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /vv/collaborators/invitation/:token/decline
  async declineInvitation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      const { id: userId, email: userEmail } = req.params;

      await this._declineInvitation.execute(token, userId, userEmail);
      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: 'Invitation declined.',
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /vv/collaborators/invitations/pending
  async getPendingInvitations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.user;
      const invitations = await this._getPendingInvitations.execute(email);
      res.status(HttpStatusCodes.OK).json({ success: true, data: invitations });
    } catch (error) {
      next(error);
    }
  }

  // POST /vv/collaborators/:username/:reponame

  async addCollaborator(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: ownerId, userId: ownerUsername } = req.user;
      const { username, reponame } = req.params;
      const { collaboratorUsername, role } = req.body;

      const repo = await this._repoRepo.findByOwnerAndName(username, reponame);
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
      const { username, reponame, collaboratorUsername } = req.params;
      const repo = await this._repoRepo.findByOwnerAndName(username, reponame);
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
    } catch (error) {
      next(error);
    }
  }

  // GET /vv/collaborators/:username/:reponame
  async getCollaborators(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, reponame } = req.params;

      const repo = await this._repoRepo.findByOwnerAndName(username, reponame);
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
      const { username, reponame, collaboratorUsername } = req.params;
      const { role } = req.body;
      const repo = await this._repoRepo.findByOwnerAndName(username, reponame);
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

      const repo = await this._repoRepo.findByOwnerAndName(username, reponame);
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

  async getAllCollabsRepo(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: userId } = req.user;
      const data = await this._getAllCollabs.execute(userId);
      res.status(HttpStatusCodes.OK).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
