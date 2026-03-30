import { GitFileEntry } from '../../../../domain/interfaces/IGitTypes';

export interface IGetFilesUseCase {
  execute(
    ownerUsername: string,
    repoName: string,
    branch: string,
    path: string,
    recursive?: boolean,
  ): Promise<GitFileEntry[]>;
}
