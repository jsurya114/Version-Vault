import { injectable, inject } from 'tsyringe';
import { IPullRequestRepository } from '../../../domain/interfaces/repositories/IPullRequestRepository';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { GitService } from '../../../infrastructure/services/GitService';
import { IMergePRUseCase } from '../interfaces/pullrequest/IMergePRUseCase';
import { PullRequestMapper } from '../../../application/mappers/PullRequestMapper';
import { PullRequestResponseDTO } from '../../../application/dtos/repository/PullRequestDTO';
import { TOKENS } from '../../../shared/constants/tokens';
import { PRValidator } from '../validators/PRValidator';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { NotificationService } from '../../../infrastructure/services/NotificationService';
import { TriggerWorkflowUseCase } from '../cicd/TriggerWorkflowUseCase';
import { envConfig } from '../../../shared/config/env.config';
import { DEFAULT_PIPELINE } from '../../../shared/constants/defaultPipeline';
import { IGetLatestWorkflowStatusUseCase } from '../interfaces/cicd/IGetLatestWorkflowStatusUseCase';

@injectable()
export class MergePRUseCase implements IMergePRUseCase {
  constructor(
    @inject(TOKENS.IPullRequestRepository) private _prRepository: IPullRequestRepository,
    @inject(TOKENS.IRepoRepository) private _repoRepository: IRepoRepository,
    @inject(GitService) private _gitService: GitService,
    @inject(TOKENS.NotificationService) private _notificationService: NotificationService,
    @inject(TriggerWorkflowUseCase) private _triggerWorkflowUseCase: TriggerWorkflowUseCase,
    @inject(TOKENS.IGetLatestWorkflowStatusUseCase)
    private _getLatestStatusUseCase: IGetLatestWorkflowStatusUseCase,
  ) {}
  async execute(id: string): Promise<PullRequestResponseDTO> {
    const pr = await PRValidator.findOrFail(this._prRepository, id);
    PRValidator.assertOpen(pr, 'merged');
    //  we need the Repository details to get the ownerUsername and repo name
    const repo = await this._repoRepository.findById(pr.repositoryId);

    if (!repo) {
      throw new NotFoundError('Repository not found for this pull request');
    }

    // Branch Protection: Block merge if the latest CI/CD pipeline has failed
    const latestRun = await this._getLatestStatusUseCase.execute(repo.id as string);

    if (latestRun) {
      if (latestRun.status === 'FAILED') {
        throw new Error(
          'Cannot merge: the latest CI/CD pipeline has failed. Fix the issues and push again.',
        );
      }
      if (latestRun.status === 'RUNNING' || latestRun.status === 'QUEUED') {
        throw new Error(
          'Cannot merge: a CI/CD pipeline is still in progress. Wait for it to complete.',
        );
      }
    }

    const baseCommits = await this._gitService.getCommits(
      repo.ownerUsername,
      repo.name,
      pr.targetBranch,
      1,
    );
    const headCommits = await this._gitService.getCommits(
      repo.ownerUsername,
      repo.name,
      pr.sourceBranch,
      1,
    );
    // Perform the actual Git merge using your new GitService method
    await this._gitService.mergeBranch(
      repo.ownerUsername,
      repo.name,
      pr.sourceBranch,
      pr.targetBranch,
    );
    const updated = await this._prRepository.update(id, {
      status: 'merged',
      baseCommitHash: baseCommits[0]?.hash,
      headCommitHash: headCommits[0]?.hash,
    });

    this._notificationService
      .notifyRepoDevelopers({
        actorId: pr.authorId,
        actorUsername: pr.authorUsername,
        type: 'pr_merged',
        message: `Pull request "${pr.title}" was merged`,
        repositoryId: pr.repositoryId,
        repositoryName: repo.name,
        metadata: { prId: pr.id! },
      })
      .catch(() => {});

    // CI/CD: Auto-trigger pipeline after merge
    try {
      const mergeCommits = await this._gitService.getCommits(
        repo.ownerUsername,
        repo.name,
        pr.targetBranch,
        1,
      );
      const commitHash = mergeCommits.length > 0 ? mergeCommits[0].hash : 'merge';
      const repoCloneUrl = `http://host.docker.internal:${envConfig.PORT}/vv/git/${repo.ownerUsername}/${repo.name}.git`;

      await this._triggerWorkflowUseCase.execute(
        repo.id as string,
        commitHash,
        DEFAULT_PIPELINE,
        repoCloneUrl,
      );
    } catch (error) {
      console.error('Failed to trigger CI/CD after PR merge:', error);
    }

    return PullRequestMapper.toDTO(updated!);
  }
}
