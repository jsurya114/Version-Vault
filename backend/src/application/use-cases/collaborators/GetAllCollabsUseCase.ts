import { injectable, inject } from 'tsyringe';
import {
  CollabRepoWithRole,
  IGetAllCollabsUseCase,
} from '../interfaces/collaborator/IGetAllCollabsUseCase';
import { ICollaboratorRepository } from '../../../domain/interfaces/repositories/ICollaboratorRepository';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { TOKENS } from '../../../shared/constants/tokens';

@injectable()
export class GetAllCollabsUseCase implements IGetAllCollabsUseCase {
  constructor(
    @inject(TOKENS.ICollaboratorRepository) private _collabRepo: ICollaboratorRepository,
    @inject(TOKENS.IRepoRepository) private _repoRepo: IRepoRepository,
  ) {}

  async execute(userId: string): Promise<CollabRepoWithRole[]> {
    const collaborations = await this._collabRepo.findByUser(userId);
    const results: CollabRepoWithRole[] = [];
    for (const collab of collaborations) {
      const repo = await this._repoRepo.findById(collab.repositoryId);
      if (repo && !repo.isDeleted) {
        results.push({ repo, role: collab.role });
      }
    }
    return results;
  }
}
