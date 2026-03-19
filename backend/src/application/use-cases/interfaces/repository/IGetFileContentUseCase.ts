export interface IGetFileContentUseCase {
  execute(
    ownerUsername: string,
    repoName: string,
    filePath: string,
    branch: string,
  ): Promise<string>;
}
