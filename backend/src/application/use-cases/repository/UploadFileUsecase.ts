import { injectable, inject } from 'tsyringe';
import { IUploadFileUseCase } from '../interfaces/repository/IUploadFileUseCase';
import { UploadFilesDTO } from '../../../application/dtos/repository/UploadFileDTO';
import { GitService } from '../../../infrastructure/services/GitService';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotificationService } from '../../../infrastructure/services/NotificationService';
import fs from 'fs';

@injectable()
export class UploadFileUseCase implements IUploadFileUseCase {
  constructor(
    @inject(GitService) private _gitService: GitService,
    @inject(TOKENS.IRepoRepository) private _repoRepo: IRepoRepository,
    @inject(TOKENS.NotificationService) private _notificationService: NotificationService,
  ) {}

  async execute(dto: UploadFilesDTO): Promise<void> {
    try {
      // Filter out files inside .git directories as Git will reject them
      const validFiles = dto.files.filter((file) => {
        const isGitInternal = file.filePath.startsWith('.git/') || file.filePath.includes('/.git/');
        if (isGitInternal) {
          // Attempt to cleanup right away if we are ignoring them
          if (fs.existsSync(file.tempDiskPath)) {
            fs.unlinkSync(file.tempDiskPath);
          }
        }
        return !isGitInternal;
      });

      if (validFiles.length === 0) {
        return; // Nothing to commit
      }

      await this._gitService.commitMultipleFiles(
        dto.ownerUsername,
        dto.repoName,
        dto.branch || 'main',
        dto.commitMessage || 'Initial commit via web upload',
        validFiles,
        dto.ownerUsername,
        dto.ownerEmail,
      );

      const repo = await this._repoRepo.findByOwnerAndName(dto.ownerUsername, dto.repoName);
      if (repo) {
        const fileCount = dto.files.length;
        this._notificationService
          .notifyRepoDevelopers({
            actorId: dto.ownerId,
            actorUsername: dto.ownerUsername,
            type: 'file_added',
            message: `${dto.ownerUsername} uploaded ${fileCount} file${fileCount > 1 ? 's' : ''}`,
            repositoryId: repo.id as string,
            repositoryName: repo.name,
          })
          .catch(() => {});
      }
    } finally {
      // Cleanup multer files after they securely exist in Git Object s
      for (const file of dto.files) {
        if (fs.existsSync(file.tempDiskPath)) {
          fs.unlinkSync(file.tempDiskPath);
        }
      }
    }
  }
}
