import { injectable, inject } from 'tsyringe';
import { ICreateCommitUseCase } from '../interfaces/commit/ICreateCommitUseCase';
import { CreateCommitDTO } from '../../../application/dtos/repository/CreateCommitDTO';
import { GitService } from '../../../infrastructure/services/GitService';

@injectable()
export class CreateCommitUseCase implements ICreateCommitUseCase {
  constructor(@inject(GitService) private _gitService: GitService) {}

  async execute(dto: CreateCommitDTO): Promise<void> {
    return this._gitService.commitChanges(
      dto.ownerUsername,
      dto.repoName,
      dto.branch,
      dto.message,
      dto.filePath,
      dto.content,
      dto.authorName,
      dto.authorEmail,
    );
  }
}
