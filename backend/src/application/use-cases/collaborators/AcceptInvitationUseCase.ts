import { injectable, inject } from 'tsyringe';
import { IAcceptInvitationUseCase } from '../interfaces/collaborator/IAcceptInvitationUseCase';
import { IInvitationRepository } from '../../../domain/interfaces/repositories/IInvitationRepository';
import { ICollaboratorRepository } from '../../../domain/interfaces/repositories/ICollaboratorRepository';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { ConflictError } from '../../../domain/errors/ConflictError';
import { UnauthorizedError } from '../../../domain/errors/UnauthorizedError';

@injectable()
export class AcceptInvitationUseCase implements IAcceptInvitationUseCase {
  constructor(
    @inject(TOKENS.IInvitationRepository) private _inviteRepo: IInvitationRepository,
    @inject(TOKENS.ICollaboratorRepository) private _collabRepo: ICollaboratorRepository,
  ) {}

  async execute(token: string, userId: string, userEmail: string, username: string): Promise<void> {
    const invitation = await this._inviteRepo.findByToken(token);
    if (!invitation) {
      throw new NotFoundError('Invitation not found');
    }
    if (invitation.status !== 'pending') {
      throw new ConflictError(`Invitation has already been ${invitation.status}`);
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      await this._inviteRepo.updateStatus(token, 'expired');
      throw new ConflictError('Invitation has expired');
    }
    // Verify the logged-in user matches the invitee email
    if (invitation.inviteeEmail !== userEmail) {
      throw new UnauthorizedError('This invitation was sent to a different email address');
    }
    // Check if already a collaborator
    const existingCollab = await this._collabRepo.findByRepoAndUser(
      invitation.repositoryId,
      userId,
    );
    if (existingCollab) {
      await this._inviteRepo.updateStatus(token, 'accepted');
      throw new ConflictError('You are already a collaborator on this repository');
    }

    await this._collabRepo.save({
      repositoryId: invitation.repositoryId,
      repositoryName: invitation.repositoryName,
      ownerId: invitation.ownerId,
      ownerUsername: invitation.ownerUsername,
      collaboratorId: userId,
      collaboratorUsername: username,
      role: invitation.role,
    });

    await this._inviteRepo.updateStatus(token, 'accepted');
  }
}
