import { CompareResponse } from 'src/domain/interfaces/IGitTypes';

export interface IGetCompareCommitsUseCase {
  execute(
    ownerUsername: string,
    repoName: string,
    targetBranch: string,
    sourceBranch: string,
  ): Promise<CompareResponse>;
}
