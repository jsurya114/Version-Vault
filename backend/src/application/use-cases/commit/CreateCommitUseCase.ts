import { injectable, inject } from 'tsyringe';
import { CreateCommitDTO } from '../../../application/dtos/repository/CreateCommitDTO';
import { ICreateCommitUseCase } from '../interfaces/commit/ICreateCommitUseCase';
import { GitService } from '../../../infrastructure/services/GitService';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotificationService } from '../../../infrastructure/services/NotificationService';
import { TriggerWorkflowUseCase } from '../cicd/TriggerWorkflowUseCase';
import { envConfig } from '../../../shared/config/env.config';
import { DEFAULT_PIPELINE } from '../../../shared/constants/defaultPipeline';

import { redisClient } from '../../../infrastructure/Redis/RedisClient';

@injectable()
export class CreateCommitUseCase implements ICreateCommitUseCase {
  constructor(
    @inject(GitService) private gitService: GitService,
    @inject(TOKENS.IRepoRepository) private _repoRepo: IRepoRepository,
    @inject(TOKENS.NotificationService) private _notificationService: NotificationService,
    @inject(TriggerWorkflowUseCase) private _triggerWorkflowUseCase: TriggerWorkflowUseCase,
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

    // Invalidate git caches so the UI updates immediately
    const keys1 = await redisClient.keys(
      `git:filecontent:${username}:${reponame}:${data.branch}:*`,
    );
    const keys2 = await redisClient.keys(`git:files:${username}:${reponame}:${data.branch}:*`);
    const allKeys = [...keys1, ...keys2];
    if (allKeys.length > 0) {
      await redisClient.del(...allKeys);
    }

    const repo = await this._repoRepo.findByOwnerAndName(username, reponame);
    if (repo) {
      // 1. Notify developers
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

      // 2. CI/CD: Trigger pipeline automatically on every push
      try {
        const commits = await this.gitService.getCommits(username, reponame, data.branch, 1);
        const commitHash = commits.length > 0 ? commits[0].hash : 'latest';
        const repoCloneUrl = `http://host.docker.internal:${envConfig.PORT}/vv/git/${username}/${reponame}.git`;

        await this._triggerWorkflowUseCase.execute(
          repo.id as string,
          commitHash,
          DEFAULT_PIPELINE,
          repoCloneUrl,
        );
      } catch (error) {
        console.error('Failed to trigger CI/CD workflow:', error);
      }
    }
  }
}
