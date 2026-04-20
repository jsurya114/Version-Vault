import { inject, injectable } from 'tsyringe';
import { IDeleteFileUseCase } from '../interfaces/repository/IDeleteFileUseCase';
import { DeleteFileDTO } from '../../../application/dtos/repository/DeleteFileDTO';
import { GitService } from '../../../infrastructure/services/GitService';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotificationService } from '../../../infrastructure/services/NotificationService';

@injectable()
export class DeleteFileUseCase implements IDeleteFileUseCase {
  constructor(
    @inject(GitService) private _gitService: GitService,
    @inject(TOKENS.IRepoRepository) private _repoRepo: IRepoRepository,
    @inject(TOKENS.NotificationService) private _notificationService: NotificationService,
  ) {}

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

    const repo = await this._repoRepo.findByOwnerAndName(dto.ownerUsername, dto.repoName);
    if (repo) {
      this._notificationService
        .notifyRepoDevelopers({
          actorId: dto.ownerId,
          actorUsername: dto.ownerUsername,
          type: 'file_deleted',
          message: `${dto.ownerUsername} deleted "${dto.filePath}"`,
          repositoryId: repo.id as string,
          repositoryName: repo.name,
        })
        .catch(() => {});
    }
  }
}
