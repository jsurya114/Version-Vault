import { injectable, inject } from 'tsyringe';
import { CreateCommitDTO } from '../../../application/dtos/repository/CreateCommitDTO';
import { ICreateCommitUseCase } from '../interfaces/commit/ICreateCommitUseCase';
import { GitService } from '../../../infrastructure/services/GitService';
@injectable()
export class CreateCommitUseCase implements ICreateCommitUseCase {
  constructor(@inject(GitService) private gitService: GitService) {}
  async execute(username: string, reponame: string, data: CreateCommitDTO): Promise<void> {
    await this.gitService.commitChanges(
      username,
      reponame,
      data.branch,
      data.message,
      data.filePath,
      data.content,
      data.authorName,
      data.authorEmail
    );
  }
}
