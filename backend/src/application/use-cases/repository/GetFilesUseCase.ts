import { injectable, inject } from 'tsyringe';
import { IGetFilesUseCase } from '../interfaces/repository/IGetFilesUseCase';
import { GitService } from '../../../infrastructure/services/GitService';
import { GitFileEntry } from '../../../domain/interfaces/IGitTypes';
import { redisClient } from '../../../infrastructure/Redis/RedisClient';

@injectable()
export class GetFilesUseCase implements IGetFilesUseCase {
  constructor(@inject(GitService) private gitService: GitService) {}

  async execute(
    ownerUsername: string,
    repoName: string,
    branch: string = 'main',
    path: string = '',
    recursive: boolean = false,
  ): Promise<GitFileEntry[]> {
    const cacheKey = `git:files:${ownerUsername}:${repoName}:${branch}:${path}:${recursive}`;
    const cachedFiles = await redisClient.get(cacheKey);

    if (cachedFiles) {
      return JSON.parse(cachedFiles) as GitFileEntry[];
    }

    const files = await this.gitService.getFiles(ownerUsername, repoName, branch, path, recursive);

    // Cache for 30 seconds to drastically reduce disk I/O during heavy traffic 
    // while ensuring code changes show up quickly after a push
    await redisClient.setex(cacheKey, 30, JSON.stringify(files));

    return files;
  }
}
