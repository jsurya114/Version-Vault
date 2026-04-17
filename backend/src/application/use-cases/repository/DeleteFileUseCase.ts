import { inject, injectable } from 'tsyringe';
import { IDeleteFileUseCase } from '../interfaces/repository/IDeleteFileUseCase';
import { DeleteFileDTO } from '../../../application/dtos/repository/DeleteFileDTO';
import { GitService } from '../../../infrastructure/services/GitService';

@injectable()
export class DeleteFileUseCase implements IDeleteFileUseCase {
  constructor(@inject(GitService) private _gitService: GitService) {}

  async execute(dto: DeleteFileDTO): Promise<void> {
    await this._gitService.deleteFile(
      dto.ownerUsername,
      dto.repoName,
      dto.branch || 'main',
      dto.commitMessage || `Delete ${dto.filePath}`,
      dto.filePath,
      dto.ownerUsername,
      dto.ownerEmail,
    );
  }
}
