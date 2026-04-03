import { injectable, inject } from 'tsyringe';
import { IRemoveCollaboratorUseCase } from '../interfaces/collaborator/IRemoveCollaboratorUseCase';
import { ICollaboratorRepository } from '../../../domain/interfaces/repositories/ICollaboratorRepository';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotFoundError } from '../../../domain/errors/NotFoundError';

@injectable()
export class RemoveCollaboratorUseCase implements IRemoveCollaboratorUseCase {
  constructor(
    @inject(TOKENS.ICollaboratorRepository) private _collabRepo: ICollaboratorRepository,
  ) {}

  async execute(ownerId: string, repositoryId: string, collaboratorId: string): Promise<void> {
    const existing = await this._collabRepo.findByRepoAndUser(repositoryId, collaboratorId);
    if (!existing) {
      throw new NotFoundError('Collaborator not found');
    }
    await this._collabRepo.deleteByRepoAndUser(repositoryId, collaboratorId);
  }
}
