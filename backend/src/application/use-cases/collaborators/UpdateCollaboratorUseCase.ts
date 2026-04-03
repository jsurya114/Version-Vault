import { injectable, inject } from 'tsyringe';
import { ICollaboratorRepository } from '../../../domain/interfaces/repositories/ICollaboratorRepository';
import { IUpdateCollaboratorUseCase } from '../interfaces/collaborator/IUpdateCollaboratorUseCase';
import { ICollaborator } from '../../../domain/interfaces/ICollaborator';

import { TOKENS } from '../../../shared/constants/tokens';
import { NotFoundError } from '../../../domain/errors/NotFoundError';

@injectable()
export class UpdateCollaboratorUseCase implements IUpdateCollaboratorUseCase {
  constructor(
    @inject(TOKENS.ICollaboratorRepository) private _collabRepo: ICollaboratorRepository,
  ) {}

  async execute(
    ownerId: string,
    repositoryId: string,
    collaboratorId: string,
    role: string,
  ): Promise<ICollaborator> {
    const existing = await this._collabRepo.findByRepoAndUser(repositoryId, collaboratorId);

    if (!existing) {
      throw new NotFoundError('Collaborator not found');
    }

    const updated = await this._collabRepo.updateRole(repositoryId, collaboratorId, role);

    if (!updated) {
      throw new NotFoundError('Failed to update collaborator role');
    }
    return updated;
  }
}
