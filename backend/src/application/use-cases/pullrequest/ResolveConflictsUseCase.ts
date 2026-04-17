import { injectable, inject } from 'tsyringe';
import { IPullRequestRepository } from '../../../domain/interfaces/repositories/IPullRequestRepository';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { GitService } from '../../../infrastructure/services/GitService';
import { IResolveConflictsUseCase } from '../interfaces/pullrequest/IResolveConflictsUseCase';
import {
  PullRequestResponseDTO,
  ResolveConflictsInput,
} from '../../dtos/repository/PullRequestDTO';
import { PullRequestMapper } from '../../mappers/PullRequestMapper';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { PRValidator } from '../validators/PRValidator';

@injectable()
export class ResolveConflictsUseCase implements IResolveConflictsUseCase {
  constructor(
    @inject(TOKENS.IPullRequestRepository) private _prRepository: IPullRequestRepository,
    @inject(TOKENS.IRepoRepository) private _repoRepository: IRepoRepository,
    @inject(GitService) private _gitService: GitService,
  ) {}

  async execute(input: ResolveConflictsInput): Promise<PullRequestResponseDTO> {
    const { prId, resolvedFiles, authorName, authorEmail } = input;
    const pr = await PRValidator.findOrFail(this._prRepository, prId);
    PRValidator.assertOpen(pr, 'merged');
    const repo = await this._repoRepository.findById(pr.repositoryId);
    if (!repo) throw new NotFoundError('Repository not found');

    // Get commit hashes BEFORE the merge (after merge, branches are identical so diff would be empty)
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

    // Resolve conflicts and create merge commit
    await this._gitService.resolveConflictsAndMerge(
      repo.ownerUsername,
      repo.name,
      pr.sourceBranch,
      pr.targetBranch,
      resolvedFiles,
      authorName,
      authorEmail,
    );

    // Mark PR as merged with the pre-merge commit hashes
    const updated = await this._prRepository.update(prId, {
      status: 'merged',
      baseCommitHash: baseCommits[0]?.hash,
      headCommitHash: headCommits[0]?.hash,
    });
    return PullRequestMapper.toDTO(updated!);
  }
}
