import { ICreateBranchUseCase } from '../interfaces/branch/ICreateBranchUseCase';
import { GitService } from '../../../infrastructure/services/GitService';
import { injectable, inject } from 'tsyringe';

@injectable()
export class CreateBranchUseCase implements ICreateBranchUseCase {
  constructor(@inject(GitService) private _gitService: GitService) {}

  async execute(
    ownerUsername: string,
    repoName: string,
    newBranch: string,
    fromBranch: string = 'main',
  ): Promise<void> {
    return this._gitService.createBranch(ownerUsername, repoName, newBranch, fromBranch);
  }
}
