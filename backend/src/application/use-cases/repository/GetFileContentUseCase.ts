import { injectable, inject } from 'tsyringe';
import { IGetFileContentUseCase } from '../interfaces/repository/IGetFileContentUseCase';
import { GitService } from '../../../infrastructure/services/GitService';
import { redisClient } from '../../../infrastructure/Redis/RedisClient';

@injectable()
export class GetFileContentUseCase implements IGetFileContentUseCase {
  constructor(@inject(GitService) private gitService: GitService) {}

  async execute(
    ownerUsername: string,
    repoName: string,
    filePath: string,
    branch: string = 'main',
  ): Promise<string> {
    const cacheKey = `git:filecontent:${ownerUsername}:${repoName}:${branch}:${filePath}`;
    const cachedContent = await redisClient.get(cacheKey);

    if (cachedContent) {
      return cachedContent;
    }

    const content = await this.gitService.getFileContent(ownerUsername, repoName, filePath, branch);

    // Cache file content for 30 seconds to drop disk I/O on active files
    await redisClient.setex(cacheKey, 30, content);

    return content;
  }
}
