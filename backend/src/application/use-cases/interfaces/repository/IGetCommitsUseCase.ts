import { GitCommit } from '../../../../domain/interfaces/IGitTypes';

export interface IGetCommitsUseCase {
  execute(
    ownerUsername: string,
    repoName: string,
    branch: string,
    limit?: number,
  ): Promise<GitCommit[]>;
}
