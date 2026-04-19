import { injectable, inject } from 'tsyringe';
import { CreateCommitDTO } from '../../../application/dtos/repository/CreateCommitDTO';
import { ICreateCommitUseCase } from '../interfaces/commit/ICreateCommitUseCase';
import { GitService } from '../../../infrastructure/services/GitService';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotificationService } from '../../../infrastructure/services/NotificationService';

@injectable()
export class CreateCommitUseCase implements ICreateCommitUseCase {
  constructor(
    @inject(GitService) private gitService: GitService,
    @inject(TOKENS.IRepoRepository) private _repoRepo: IRepoRepository,
    @inject(TOKENS.NotificationService) private _notificationService: NotificationService,
  ) {}

  async execute(
    username: string,
    reponame: string,
    data: CreateCommitDTO,
    actorId: string,
    actorUsername: string,
  ): Promise<void> {
    await this.gitService.commitChanges(
      username,
      reponame,
      data.branch,
      data.message,
      data.filePath,
      data.content,
      data.authorName,
      data.authorEmail,
    );

    const repo = await this._repoRepo.findByOwnerAndName(username, reponame);
    if (repo) {
      this._notificationService
        .notifyRepoDevelopers({
          actorId,
          actorUsername,
          type: 'new_commit',
          message: `${actorUsername} pushed a commit: "${data.message}"`,
          repositoryId: repo.id as string,
          repositoryName: repo.name,
        })
        .catch(() => {});
    }
  }
}
