import { injectable, inject } from 'tsyringe';
import { IGetBranchesUseCase } from '../interfaces/branch/IGetBranchesUseCase';
import { GitService } from '../../../infrastructure/services/GitService';
import { GitBranch } from 'src/domain/interfaces/IGitTypes';

@injectable()
export class GetBranchesUseCase implements IGetBranchesUseCase {
  constructor(@inject(GitService) private gitService: GitService) {}

  async execute(ownerUsername: string, repoName: string): Promise<GitBranch[]> {
    return this.gitService.getBranches(ownerUsername, repoName);
  }
}
