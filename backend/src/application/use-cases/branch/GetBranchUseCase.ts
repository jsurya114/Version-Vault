import { injectable, inject } from 'tsyringe';
import { IGetBranchesUseCase } from '../interfaces/branch/IGetBranchesUseCase';
import { GitService } from '../../../infrastructure/services/GitService';
import { GitBranch } from '../../../domain/interfaces/IGitTypes';
import { IPullRequestRepository } from '../../../domain/interfaces/repositories/IPullRequestRepository';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { IBranchRepository } from '../../../domain/interfaces/repositories/IBranchRepository';
import { TOKENS } from '../../../shared/constants/tokens';
import { logger } from '../../../shared/logger/Logger';

@injectable()
export class GetBranchesUseCase implements IGetBranchesUseCase {
  constructor(
    @inject(GitService) private gitService: GitService,
    @inject(TOKENS.IPullRequestRepository) private _prRepo: IPullRequestRepository,
    @inject(TOKENS.IRepoRepository) private _repoRepo: IRepoRepository,
    @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
    @inject(TOKENS.IBranchRepository) private _branchRepo: IBranchRepository,
  ) {}

  async execute(ownerUsername: string, repoName: string): Promise<GitBranch[]> {
    const branches = await this.gitService.getBranches(ownerUsername, repoName);
    const repo = await this._repoRepo.findByOwnerAndName(ownerUsername, repoName);
    if (!repo) {
      logger.warn('Repo not found: ' + ownerUsername + '/' + repoName);
      return branches;
    }

    logger.info('Repo ID: ' + repo.id);

    const prs = await this._prRepo.findByRepo(repo.id!, { page: 1, limit: 100 });

    const branchRecords = await this._branchRepo.find({ repositoryId: repo.id as string });

    return Promise.all(
      branches.map(async (branch) => {
        // Find the latest PR associated with this branch, regardless of if it's open, closed or merged
        const matchingPr = prs.data.find((pr) => pr.sourceBranch.trim() === branch.name.trim());
        const branchRecord = branchRecords.find((r) => r.branchName === branch.name);

        let createdByUsername = branch.lastCommitAuthor;
        if (branchRecord && branch.ahead === 0) {
          const creator = await this._userRepo.findById(branchRecord.createdBy.toString());
          if (creator) {
            createdByUsername = creator.username;
          }
        }

        return {
          ...branch,
          lastCommitAuthor: createdByUsername,
          createdBy: branchRecord ? branchRecord.createdBy.toString() : undefined,
          prId: matchingPr ? matchingPr.id : undefined,
          prNumber: matchingPr ? matchingPr.prNumber : undefined,
          prStatus: matchingPr ? matchingPr.status : undefined,
        };
      }),
    );
  }
}
