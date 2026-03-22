import { injectable, inject } from 'tsyringe';
import { IGetBranchesUseCase } from '../interfaces/repository/IGetBranchesUseCase';
import { GitService } from 'src/infrastructure/services/GitService';

@injectable()
export class GetBranchesUseCase implements IGetBranchesUseCase {
  constructor(@inject(GitService) private gitService: GitService) {}

  async execute(ownerUsername: string, repoName: string): Promise<string[]> {
    return this.gitService.getBranches(ownerUsername, repoName);
  }
}
