export interface IRenameBranchUseCase {
  execute(
    username: string,
    reponame: string,
    oldBranchName: string,
    newBranchName: string,
    actorId: string,
    actorUsername: string,
  ): Promise<void>;
}
