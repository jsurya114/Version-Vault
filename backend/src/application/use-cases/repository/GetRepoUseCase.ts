import { injectable, inject } from 'tsyringe';
import { IGetRepoUseCase } from '../interfaces/repository/IGetRepoUseCase';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { RepoResponseDTO } from '../../../application/dtos/repository/RepoResponseDTO';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { RepositoryMapper } from '../../../application/mappers/RepositoryMapper';
import { RepositoryVisibility } from '../../../domain/enums';
import { ICollaboratorRepository } from '../../../domain/interfaces/repositories/ICollaboratorRepository';
import { redisClient } from '../../../infrastructure/Redis/RedisClient';

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
    const cacheKey = `repo:${ownerUsername}:${name}`;
    let repo;

    const cachedRepo = await redisClient.get(cacheKey);
    if (cachedRepo) {
      repo = JSON.parse(cachedRepo);
    } else {
      repo = await this.repoRepository.findByOwnerAndName(ownerUsername, name);
      if (repo) {
        // Cache the raw repository entity for 5 minutes
        await redisClient.setex(cacheKey, 300, JSON.stringify(repo));
      }
    }

    if (!repo) throw new NotFoundError('Repository not found');
    if (repo.isBlocked) {
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
        const collabCacheKey = `collab:${repo.id}:${authenticatedUserId}`;
        const cachedCollab = await redisClient.get(collabCacheKey);
        
        if (cachedCollab) {
          iscollabed = JSON.parse(cachedCollab);
        } else {
          const collab = await this._collabRepo.findByRepoAndUser(repo.id!, authenticatedUserId);
          iscollabed = !!collab;
          await redisClient.setex(collabCacheKey, 300, JSON.stringify(iscollabed));
        }
      }
      
      if (!isOwner && !iscollabed) {
        throw new Error('Repository not found');
      }
    }
    return RepositoryMapper.toDTO(repo);
  }
}
