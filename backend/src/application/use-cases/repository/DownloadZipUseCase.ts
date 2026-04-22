import { Readable } from 'stream';
import { IDownloadZipUseCase } from '../interfaces/repository/IDownloadZipUseCase';
import { injectable, inject } from 'tsyringe';

import { GitService } from '../../../infrastructure/services/GitService';

@injectable()
export class DownloadZipUseCase implements IDownloadZipUseCase {
  constructor(@inject(GitService) private _gitService: GitService) {}

  async excute(ownerUsername: string, repoName: string, branch: string): Promise<Readable> {
    return this._gitService.archiveRepo(ownerUsername, repoName, branch);
  }
}
