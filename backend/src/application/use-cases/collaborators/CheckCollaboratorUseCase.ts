import { injectable, inject } from 'tsyringe';
import { ICheckCollaboratorUseCase } from '../interfaces/collaborator/ICheckCollaboratorUseCase';
import { ICollaboratorRepository } from '../../../domain/interfaces/repositories/ICollaboratorRepository';
import { TOKENS } from '../../../shared/constants/tokens';

@injectable()
export class CheckCollaboratorUseCase implements ICheckCollaboratorUseCase {
  constructor(
    @inject(TOKENS.ICollaboratorRepository) private _collabRepo: ICollaboratorRepository,
  ) {}

  async execute(repositoryId: string, userId: string): Promise<boolean> {
    const collab = await this._collabRepo.findByRepoAndUser(repositoryId, userId);
    return collab !== null;
  }
}
