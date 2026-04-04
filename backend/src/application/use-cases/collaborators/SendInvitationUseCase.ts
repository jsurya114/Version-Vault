import { injectable, inject } from 'tsyringe';
import { randomUUID } from 'crypto';
import { ISendInvitationUseCase } from '../interfaces/collaborator/ISendInvitationUseCase';
import { IInvitationRepository } from '../../../domain/interfaces/repositories/IInvitationRepository';
import { ICollaboratorRepository } from '../../../domain/interfaces/repositories/ICollaboratorRepository';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { IEmailService } from '../../../domain/interfaces/services/IEmailService';
import { IInvitation } from '../../../domain/interfaces/IInvitation';
import { TOKENS } from '../../../shared/constants/tokens';
import { ConflictError } from '../../../domain/errors/ConflictError';
import { envConfig } from '../../../shared/config/env.config';

@injectable()
export class SendInvitationUseCase implements ISendInvitationUseCase {
  constructor(
    @inject(TOKENS.IInvitationRepository) private _inviteRepo: IInvitationRepository,
    @inject(TOKENS.ICollaboratorRepository) private _collabRepo: ICollaboratorRepository,
    @inject(TOKENS.IEmailService) private _emailService: IEmailService,
    @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
  ) {}

  async execute(
    ownerId: string,
    ownerUsername: string,
    repositoryId: string,
    repositoryName: string,
    inviteeEmail: string,
    role: string,
  ): Promise<IInvitation> {
    const owner = await this._userRepo.findById(ownerId);

    if (owner && owner.email === inviteeEmail) {
      throw new ConflictError('You cannot invite yourself');
    }

    const existingUser = await this._userRepo.findByEmail(inviteeEmail);
    if (existingUser) {
      const existingCollab = await this._collabRepo.findByRepoAndUser(
        repositoryId,
        existingUser.id!,
      );
      if (existingCollab) {
        throw new ConflictError('User is already a collaborator');
      }
    }

    const existingInvitation = await this._inviteRepo.findPendingByRepoAndEmail(
      repositoryId,
      inviteeEmail,
    );
    if (existingInvitation) {
      throw new ConflictError('An invitation is already pending for this user');
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); //7days

    const invitation = await this._inviteRepo.save({
      token,
      repositoryId,
      repositoryName,
      ownerId,
      ownerUsername,
      inviteeEmail,
      inviteeUserId: existingUser?.id,
      inviteeUsername: existingUser?.userId,
      role: role || 'read',
      status: 'pending',
      expiresAt,
    });

    const inviteLink = `${envConfig.CLIENT_URL}/invitation/accept/${token}`;
    await this._emailService.sendInvitationEmail(
      inviteeEmail,
      ownerUsername,
      repositoryName,
      role || 'read',
      inviteLink,
    );
    return invitation;
  }
}
