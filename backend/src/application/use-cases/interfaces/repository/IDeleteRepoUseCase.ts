export interface IDeleteRepoUsecase {
  execute(ownerUsername: string, name: string): Promise<void>;
}
