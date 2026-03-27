import { injectable, inject } from 'tsyringe';
import { IDeleteBranchUseCase } from '../interfaces/branch/IDeleteBranchUseCase';
import { GitService } from 'src/infrastructure/services/GitService';
import { IRepoRepository } from 'src/domain/interfaces/repositories/IRepoRepository';
import { NotFoundError } from 'src/domain/errors/NotFoundError';
import { TOKENS } from 'src/shared/constants/tokens';

@injectable()
export class DeleteBranchUseCase implements IDeleteBranchUseCase {
  constructor(
    @inject(GitService) private _gitService: GitService,
    @inject(TOKENS.IRepoRepository) private _repoRepository: IRepoRepository,
  ) {}

  async execute(username: string, reponame: string, branchName: string): Promise<void> {
    // check the branch is protected
    if (branchName === 'main' || branchName === 'master') {
      throw new Error('cannot be deleted the main branch');
    }
    const repo = await this._repoRepository.findByOwnerAndName(username, reponame);
    if (!repo) {
      throw new NotFoundError('Repository not found');
    }

    await this._gitService.deleteBranch(username, reponame, branchName);
  }
}
