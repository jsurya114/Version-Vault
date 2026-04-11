import { injectable, inject } from 'tsyringe';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { IPullRequestRepository } from '../../../domain/interfaces/repositories/IPullRequestRepository';
import { GitService } from '../../../infrastructure/services/GitService';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { IGetActiveBranchUseCase } from '../interfaces/repository/IGetActiveBranchUseCase';
import { ActiveBranchDTO } from '../../../application/dtos/repository/ActiveBranchDTO';

@injectable()
export class GetActiveBranchUseCase implements IGetActiveBranchUseCase {
  constructor(
    @inject(TOKENS.IRepoRepository) private _repoRepo: IRepoRepository,
    @inject(TOKENS.IPullRequestRepository) private _pullrequestRepo: IPullRequestRepository,
    @inject(GitService) private _gitService: GitService,
  ) {}

  async execute(ownerUsername: string, repoName: string): Promise<ActiveBranchDTO[]> {
    const repo = await this._repoRepo.findByOwnerAndName(ownerUsername, repoName);
    if (!repo) throw new NotFoundError('Repository not found');

    const branches = await this._gitService.getBranches(ownerUsername, repoName);
    const defaultBranch = repo.defaultBranch || 'main';
    const activeBranches: ActiveBranchDTO[] = [];
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const now = Date.now();

    for (const b of branches) {
      if (b.name === defaultBranch) continue;
      //is it recent(pushed in last 24h)

      const lastCommitTime = b.lastCommitDate ? new Date(b.lastCommitDate).getTime() : 0;
      if (now - lastCommitTime > ONE_DAY_MS) continue;

      //is it ahead of default?
      const ahead = await this._gitService.isAhead(ownerUsername, repoName, defaultBranch, b.name);
      if (!ahead) continue;

      //does it already have an open pr
      const pr = await this._pullrequestRepo.findLatestOpenPR(repo.id!, b.name, defaultBranch);
      if (pr && pr.mergeApproval !== 'rejected') continue;

      activeBranches.push({
        name: b.name,
        lastCommitDate: b.lastCommitDate || '',
        lastCommitAuthor: b.lastCommitAuthor || '',
        lastCommitMessage: b.lastCommitMessage || '',
        isRejected: pr?.mergeApproval === 'rejected',
      });
    }
    //sort by most recently updated
    return activeBranches.sort(
      (a, b) => new Date(b.lastCommitDate).getTime() - new Date(a.lastCommitDate).getTime(),
    );
  }
}
