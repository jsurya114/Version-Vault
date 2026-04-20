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

@injectable()
export class MergePRUseCase implements IMergePRUseCase {
  constructor(
    @inject(TOKENS.IPullRequestRepository) private _prRepository: IPullRequestRepository,
    @inject(TOKENS.IRepoRepository) private _repoRepository: IRepoRepository,
    @inject(GitService) private _gitService: GitService,
    @inject(TOKENS.NotificationService) private _notificationService: NotificationService,
  ) {}
  async execute(id: string): Promise<PullRequestResponseDTO> {
    const pr = await PRValidator.findOrFail(this._prRepository, id);
    PRValidator.assertOpen(pr, 'merged');
    //  we need the Repository details to get the ownerUsername and repo name
    const repo = await this._repoRepository.findById(pr.repositoryId);

    if (!repo) {
      throw new NotFoundError('Repository not found for this pull request');
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

    return PullRequestMapper.toDTO(updated!);
  }
}
