import { injectable, inject } from 'tsyringe';
import { IDeleteBranchUseCase } from '../interfaces/branch/IDeleteBranchUseCase';
import { GitService } from '../../../infrastructure/services/GitService';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotificationService } from '../../../infrastructure/services/NotificationService';

@injectable()
export class DeleteBranchUseCase implements IDeleteBranchUseCase {
  constructor(
    @inject(GitService) private _gitService: GitService,
    @inject(TOKENS.IRepoRepository) private _repoRepository: IRepoRepository,
    @inject(TOKENS.NotificationService) private _notificationService: NotificationService,
  ) {}

  async execute(
    username: string,
    reponame: string,
    branchName: string,
    actorId: string,
    actorUsername: string,
  ): Promise<void> {
    // check the branch is protected
    if (branchName === 'main' || branchName === 'master') {
      throw new Error('cannot be deleted the main branch');
    }
    const repo = await this._repoRepository.findByOwnerAndName(username, reponame);
    if (!repo) {
      throw new NotFoundError('Repository not found');
    }

    await this._gitService.deleteBranch(username, reponame, branchName);

    this._notificationService
      .notifyRepoDevelopers({
        actorId,
        actorUsername,
        type: 'branch_deleted',
        message: `${actorUsername} deleted branch "${branchName}"`,
        repositoryId: repo.id as string,
        repositoryName: repo.name,
      })
      .catch(() => {});
  }
}
