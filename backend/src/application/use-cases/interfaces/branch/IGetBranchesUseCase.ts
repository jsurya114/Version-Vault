import { GitBranch } from '../../../../domain/interfaces/IGitTypes';
export interface IGetBranchesUseCase {
  execute(ownerUsername: string, repoName: string): Promise<GitBranch[]>;
}
