import { injectable, inject } from 'tsyringe';
import { IUploadFileUseCase } from '../interfaces/repository/IUploadFileUseCase';
import { UploadFilesDTO } from '../../../application/dtos/repository/UploadFileDTO';
import { GitService } from '../../../infrastructure/services/GitService';
import fs from 'fs';

@injectable()
export class UploadFileUseCase implements IUploadFileUseCase {
  constructor(@inject(GitService) private _gitService: GitService) {}

  async execute(dto: UploadFilesDTO): Promise<void> {
    try {
      await this._gitService.commitMultipleFiles(
        dto.ownerUsername,
        dto.repoName,
        dto.branch || 'main',
        dto.commitMessage || 'Initial commit via web upload',
        dto.files,
        dto.ownerUsername,
        dto.ownerEmail,
      );
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
