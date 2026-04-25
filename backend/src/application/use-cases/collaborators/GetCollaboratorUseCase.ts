import { injectable, inject } from 'tsyringe';
import { IGetCollaboratorUseCase } from '../interfaces/collaborator/IGetCollaboratorUseCase';
import { ICollaboratorRepository } from '../../../domain/interfaces/repositories/ICollaboratorRepository';
import { ICollaborator } from '../../../domain/interfaces/ICollaborator';
import { TOKENS } from '../../../shared/constants/tokens';

@injectable()
export class GetCollaboratorUseCase implements IGetCollaboratorUseCase {
  constructor(
    @inject(TOKENS.ICollaboratorRepository) private _collabRepo: ICollaboratorRepository,
  ) {}

  async execute(repositoryId: string): Promise<ICollaborator[]> {
    return this._collabRepo.findByRepository(repositoryId);
  }
}
