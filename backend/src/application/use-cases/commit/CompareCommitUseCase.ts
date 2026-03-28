import { injectable, inject } from 'tsyringe';

import { GitService } from 'src/infrastructure/services/GitService';

import { CompareResponse } from 'src/domain/interfaces/IGitTypes';
import { ICompareCommitUseCase } from '../interfaces/commit/ICompareCommitUseCase';

@injectable()
export class CompareCommitUseCase implements ICompareCommitUseCase {
  constructor(@inject(GitService) private readonly _gitService: GitService) {}

  async execute(
    username: string,
    reponame: string,
    base: string,
    head: string,
  ): Promise<CompareResponse> {
    return await this._gitService.compareGitCommits(username, reponame, base, head);
  }
}
