import { ICreateBranchUseCase } from '../interfaces/branch/ICreateBranchUseCase';
import { GitService } from '../../../infrastructure/services/GitService';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { NotificationService } from '../../../infrastructure/services/NotificationService';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../shared/constants/tokens';

import { IBranchRepository } from '../../../domain/interfaces/repositories/IBranchRepository';

@injectable()
export class CreateBranchUseCase implements ICreateBranchUseCase {
  constructor(
    @inject(GitService) private _gitService: GitService,
    @inject(TOKENS.IRepoRepository) private _repoRepo: IRepoRepository,
    @inject(TOKENS.NotificationService) private _notificationService: NotificationService,
    @inject(TOKENS.IBranchRepository) private _branchRepo: IBranchRepository,
  ) {}

  async execute(
    ownerUsername: string,
    repoName: string,
    newBranch: string,
    fromBranch: string = 'main',
    actorId: string,
    actorUsername: string,
  ): Promise<void> {
    await this._gitService.createBranch(ownerUsername, repoName, newBranch, fromBranch);

    const repo = await this._repoRepo.findByOwnerAndName(ownerUsername, repoName);
    if (repo) {
      await this._branchRepo.save({
        repositoryId: repo.id as string,
        branchName: newBranch,
        createdBy: actorId,
        createdAt: new Date(),
      });

      this._notificationService
        .notifyRepoDevelopers({
          actorId,
          actorUsername,
          type: 'branch_created',
          message: `${actorUsername} created branch "${newBranch}"`,
          repositoryId: repo.id as string,
          repositoryName: repo.name,
        })
        .catch(() => {});
    }
  }
}
