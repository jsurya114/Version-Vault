export interface IDeleteBranchUseCase {
  execute(
    username: string,
    reponame: string,
    branchName: string,
    actorId: string,
    actorUsername: string,
  ): Promise<void>;
}
