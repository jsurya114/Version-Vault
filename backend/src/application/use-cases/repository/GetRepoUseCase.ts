import { injectable, inject } from 'tsyringe';
import { IGetRepoUseCase } from '../interfaces/repository/IGetRepoUseCase';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { RepoResponseDTO } from '../../../application/dtos/repository/RepoResponseDTO';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { RepositoryMapper } from '../../../application/mappers/RepositoryMapper';
import { RepositoryVisibility } from 'src/domain/enums';
import { ICollaboratorRepository } from 'src/domain/interfaces/repositories/ICollaboratorRepository';

@injectable()
export class GetRepoUseCase implements IGetRepoUseCase {
  constructor(
    @inject(TOKENS.IRepoRepository) private repoRepository: IRepoRepository,
    @inject(TOKENS.ICollaboratorRepository) private _collabRepo: ICollaboratorRepository,
  ) {}

  async execute(
    ownerUsername: string,
    name: string,
    authenticatedUserId?: string,
  ): Promise<RepoResponseDTO> {
    const repo = await this.repoRepository.findByOwnerAndName(ownerUsername, name);
    if (!repo) throw new NotFoundError('Repository not found');
    if (!repo || repo.isBlocked) {
      throw new NotFoundError('Repository not found or is currently suspended');
    }
    if (repo.isDeleted) {
      throw new NotFoundError('Repository not found');
    }

    if (repo.visibility === RepositoryVisibility.PRIVATE) {
      const isOwner =
        authenticatedUserId && repo.ownerId?.toString() === authenticatedUserId.toString();
      let iscollabed = false;
      if (!isOwner && authenticatedUserId) {
        const collab = await this._collabRepo.findByRepoAndUser(repo.id!, authenticatedUserId);
        if (collab) iscollabed = true;
      }
      if (!isOwner && !iscollabed) {
        throw new Error('Repository not found');
      }
    }
    return RepositoryMapper.toDTO(repo);
  }
}
