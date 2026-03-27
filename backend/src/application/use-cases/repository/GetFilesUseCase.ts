import { injectable, inject } from 'tsyringe';
import { IGetFilesUseCase } from '../interfaces/repository/IGetFilesUseCase';
import { GitService } from '../../../infrastructure/services/GitService';
import { GitFileEntry } from '../../../domain/interfaces/IGitTypes';

@injectable()
export class GetFilesUseCase implements IGetFilesUseCase {
  constructor(@inject(GitService) private gitService: GitService) {}

  async execute(
    ownerUsername: string,
    repoName: string,
    branch: string = 'main',
    path: string = '',
  ): Promise<GitFileEntry[]> {
    return this.gitService.getFiles(ownerUsername, repoName, branch, path);
  }
}
