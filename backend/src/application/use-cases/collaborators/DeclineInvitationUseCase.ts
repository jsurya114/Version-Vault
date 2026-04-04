import { injectable, inject } from 'tsyringe';
import { IDeclineInvitationUseCase } from '../interfaces/collaborator/IDeclineInvitationUseCase';
import { IInvitationRepository } from '../../../domain/interfaces/repositories/IInvitationRepository';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { ConflictError } from '../../../domain/errors/ConflictError';
import { UnauthorizedError } from '../../../domain/errors/UnauthorizedError';

@injectable()
export class DeclineInvitationUseCase implements IDeclineInvitationUseCase {
  constructor(@inject(TOKENS.IInvitationRepository) private _inviteRepo: IInvitationRepository) {}

  async execute(token: string, userId: string, userEmail: string): Promise<void> {
    const invitation = await this._inviteRepo.findByToken(token);

    if (!invitation) {
      throw new NotFoundError('Invitation not found');
    }
    if (invitation.status !== 'pending') {
      throw new ConflictError(`Invitation has already been ${invitation.status}`);
    }
    if (invitation.inviteeEmail !== userEmail) {
      throw new UnauthorizedError('This invitation was sent to a different email address');
    }

    await this._inviteRepo.updateStatus(token, 'declined');
  }
}
