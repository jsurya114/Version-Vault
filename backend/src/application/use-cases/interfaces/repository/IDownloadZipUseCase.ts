import { Readable } from 'stream';

export interface IDownloadZipUseCase {
  excute(ownerUsername: string, repoName: string, branch: string): Promise<Readable>;
}
