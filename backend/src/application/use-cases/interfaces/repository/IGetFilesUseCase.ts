import { GitFileEntry } from 'src/domain/interfaces/IGitTypes';

export interface IGetFilesUseCase {
  execute(
    ownerUsername: string,
    repoName: string,
    branch: string,
    path: string,
  ): Promise<GitFileEntry[]>;
}
