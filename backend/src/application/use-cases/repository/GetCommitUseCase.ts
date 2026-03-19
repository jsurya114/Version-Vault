import { injectable, inject } from 'tsyringe';
import { IGetCommitsUseCase } from '../interfaces/repository/IGetCommitsUseCase';
import { GitService } from 'src/infrastructure/services/GitService';
import { GitCommit } from 'src/domain/interfaces/IGitTypes';

@injectable()
export class GetCommitUseCase implements IGetCommitsUseCase {
  constructor(@inject(GitService) private gitService: GitService) {}

  async execute(
    ownerUsername: string,
    repoName: string,
    branch: string = 'main',
    limit: number = 20,
  ): Promise<GitCommit[]> {
    return this.gitService.getCommits(ownerUsername, repoName, branch, limit);
  }
}
