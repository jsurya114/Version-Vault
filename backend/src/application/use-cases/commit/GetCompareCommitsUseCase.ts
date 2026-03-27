import { injectable, inject } from 'tsyringe';
import { IGetCompareCommitsUseCase } from '../interfaces/commit/IGetCompareCommitsUseCase';
import { GitService } from '../../../infrastructure/services/GitService';
import { CompareResponse } from '../../../domain/interfaces/IGitTypes';

@injectable()
export class GetCompareCommitsUseCase implements IGetCompareCommitsUseCase {
  constructor(@inject(GitService) private _gitService: GitService) {}
  async execute(
    ownerUsername: string,
    repoName: string,
    targetBranch: string,
    sourceBranch: string,
  ): Promise<CompareResponse> {
    return this._gitService.compareGitCommits(ownerUsername, repoName, targetBranch, sourceBranch);
  }
}
