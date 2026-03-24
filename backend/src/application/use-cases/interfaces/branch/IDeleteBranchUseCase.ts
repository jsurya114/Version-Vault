export interface IDeleteBranchUseCase {
  execute(username: string, reponame: string, branchName: string): Promise<void>;
}
