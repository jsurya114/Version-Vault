import { injectable, inject } from 'tsyringe';
import { IAddCollaboratorUseCase } from '../interfaces/collaborator/IAddCollaboratorUseCase';
import { ICollaboratorRepository } from '../../../domain/interfaces/repositories/ICollaboratorRepository';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { TOKENS } from '../../../shared/constants/tokens';
import { ConflictError } from '../../../domain/errors/ConflictError';
import { NotFoundError } from '../../../domain/errors/NotFoundError';

@injectable()
export class AddCollaboratorUseCase implements IAddCollaboratorUseCase {
  constructor(
    @inject(TOKENS.ICollaboratorRepository) private _collabRepo: ICollaboratorRepository,
    @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
  ) {}

  async execute(
    ownerId: string,
    ownerUsername: string,
    repositoryId: string,
    repositoryName: string,
    collaboratorUsername: string,
    role: string,
  ): Promise<void> {
    if (ownerUsername === collaboratorUsername) {
      throw new ConflictError('You cannot add yourself as a collaborator');
    }

    const targetUser =
      (await this._userRepo.findByUserId(collaboratorUsername)) ||
      (await this._userRepo.findByUserName(collaboratorUsername));

    if (!targetUser) {
      throw new NotFoundError('User not found');
    }

    const existing = await this._collabRepo.findByRepoAndUser(repositoryId, targetUser.id!);
    if (existing) {
      throw new ConflictError('User is already a collaborator');
    }

    await this._collabRepo.save({
      repositoryId,
      repositoryName,
      ownerId,
      ownerUsername,
      collaboratorId: targetUser.id!,
      collaboratorUsername: targetUser.userId,
      role: role || 'read',
    });
  }
}
