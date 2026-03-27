export interface ICreateBranchUseCase {
  execute(
    ownerUsername: string,
    repoName: string,
    newBranch: string,
    fromBranch: string,
  ): Promise<void>;
}
