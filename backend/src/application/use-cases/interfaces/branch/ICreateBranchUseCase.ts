export interface ICreateBranchUseCase {
  execute(
    ownerUsername: string,
    repoName: string,
    newBranch: string,
    fromBranch: string,
    actorId: string,
    actorUsername: string,
  ): Promise<void>;
}
