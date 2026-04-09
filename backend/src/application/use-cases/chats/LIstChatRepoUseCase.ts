import { injectable, inject } from 'tsyringe';
import { ICollaboratorRepository } from '../../../domain/interfaces/repositories/ICollaboratorRepository';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { TOKENS } from '../../../shared/constants/tokens';
import { RepositoryMapper } from '../../../application/mappers/RepositoryMapper';
import { IListChatRepoUseCase } from '../../../application/use-cases/interfaces/chats/IListChatRepoUseCase';
import { RepoResponseDTO } from '../../../application/dtos/repository/RepoResponseDTO';
import { logger } from '../../../shared/logger/Logger';
import { IRepository } from '../../../domain/interfaces/IRepository';

@injectable()
export class ListChatRepoUseCase implements IListChatRepoUseCase {
  constructor(
    @inject(TOKENS.IRepoRepository) private _repoRepo: IRepoRepository,
    @inject(TOKENS.ICollaboratorRepository) private _collabRepo: ICollaboratorRepository,
  ) {}

  async execute(userId: string): Promise<RepoResponseDTO[]> {
    logger.info(`Fetching chat repositories for user ID: ${userId}`);
    const collaborations = await this._collabRepo.findCollabedRepos(userId);
    logger.info(`Found ${collaborations.length} collaboration records for user ${userId}`);
    const repoIds = [...new Set(collaborations.map((c) => c.repositoryId))];
    if (collaborations.length === 0) {
      logger.warn(`No collaborations found in DB for user ${userId}. Sidebar will be empty.`);
      return [];
    }
    logger.info(`Unique repository IDs to fetch: ${repoIds.join(', ')}`);
    const repos = await Promise.all(
      repoIds.map(async (id) => {
        const repo = await this._repoRepo.findById(id);
        if (!repo) {
          logger.error(
            `REPOSITORY DATA MISSING: Found collaboration for repo ID ${id}, but repository document does not exist.`,
          );
        }
        return repo;
      }),
    );

    const filteredRepos = repos.filter((r): r is IRepository => r !== null);
    logger.info(`Successfully mapped ${filteredRepos.length} repositories to DTOs.`);
    return filteredRepos.map(RepositoryMapper.toDTO);
  }
}
