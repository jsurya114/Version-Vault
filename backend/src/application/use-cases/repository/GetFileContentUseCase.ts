import { injectable, inject } from 'tsyringe';
import { IGetFileContentUseCase } from '../interfaces/repository/IGetFileContentUseCase';
import { GitService } from '../../../infrastructure/services/GitService';

@injectable()
export class GetFileContentUseCase implements IGetFileContentUseCase {
  constructor(@inject(GitService) private gitService: GitService) {}

  async execute(
    ownerUsername: string,
    repoName: string,
    filePath: string,
    branch: string = 'main',
  ): Promise<string> {
    return this.gitService.getFileContent(ownerUsername, repoName, filePath, branch);
  }
}
