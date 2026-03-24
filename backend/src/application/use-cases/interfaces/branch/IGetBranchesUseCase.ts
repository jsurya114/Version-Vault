export interface IGetBranchesUseCase {
  execute(ownerUsername: string, repoName: string): Promise<string[]>;
}
