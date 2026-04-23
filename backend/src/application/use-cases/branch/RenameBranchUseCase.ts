import { injectable, inject } from 'tsyringe';
import { IRenameBranchUseCase } from '../interfaces/branch/IRenameBranchUseCase';
import { GitService } from '../../../infrastructure/services/GitService';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotificationService } from '../../../infrastructure/services/NotificationService';
import { IBranchRepository } from '../../../domain/interfaces/repositories/IBranchRepository';
import { UnauthorizedError } from '../../../domain/errors/UnauthorizedError';

@injectable()
export class RenameBranchUseCase implements IRenameBranchUseCase {
  constructor(
    @inject(GitService) private _gitService: GitService,
    @inject(TOKENS.IRepoRepository) private _repoRepo: IRepoRepository,
    @inject(TOKENS.NotificationService) private _notifyService: NotificationService,
    @inject(TOKENS.IBranchRepository) private _branchRepo: IBranchRepository,
  ) {}

  async execute(
    username: string,
    reponame: string,
    oldBranchName: string,
    newBranchName: string,
    actorId: string,
    actorUsername: string,
  ): Promise<void> {
    if (oldBranchName === 'main' || oldBranchName === 'master') {
      throw new UnauthorizedError('cannot rename the main/master branch');
    }
    const repo = await this._repoRepo.findByOwnerAndName(username, reponame);
    if (!repo) {
      throw new NotFoundError('Repository not found');
    }
    const isOwner = repo.ownerId.toString() === actorId;
    if (!isOwner) {
      const branchRecord = await this._branchRepo.findByRepoAndBranch(
        repo.id as string,
        oldBranchName,
      );
      if (!branchRecord || branchRecord.createdBy.toString() !== actorId) {
        throw new UnauthorizedError('You can only rename branches that you created');
      }
    }
    // Git physically renaming the branch
    await this._gitService.renameBranch(username, reponame, oldBranchName, newBranchName);
    // Update in Mongo
    await this._branchRepo.updateBranchName(repo.id as string, oldBranchName, newBranchName);

    this._notifyService
      .notifyRepoDevelopers({
        actorId,
        actorUsername,
        type: 'branch_updated',
        message: `${actorUsername} renamed branch "${oldBranchName}" to "${newBranchName}"`,
        repositoryId: repo.id as string,
        repositoryName: repo.name,
      })
      .catch(() => {});
  }
}
