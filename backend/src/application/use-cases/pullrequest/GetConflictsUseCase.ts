import { injectable, inject } from 'tsyringe';
import { IPullRequestRepository } from '../../../domain/interfaces/repositories/IPullRequestRepository';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { GitService } from '../../../infrastructure/services/GitService';
import { IGetConflictsUseCase } from '../interfaces/pullrequest/IGetConflictsUseCase';
import { ConflictDetails } from '../../../domain/interfaces/IGitTypes';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotFoundError } from '../../../domain/errors/NotFoundError';

@injectable()
export class GetConflictsUseCase implements IGetConflictsUseCase {
  constructor(
    @inject(TOKENS.IPullRequestRepository) private _prRepository: IPullRequestRepository,
    @inject(TOKENS.IRepoRepository) private _repoRepository: IRepoRepository,
    @inject(GitService) private _gitService: GitService,
  ) {}

  async execute(prId: string): Promise<ConflictDetails> {
    const pr = await this._prRepository.findById(prId);
    if (!pr) throw new NotFoundError('PR not found');

    const repo = await this._repoRepository.findById(pr.repositoryId);
    if (!repo) throw new NotFoundError('Repository not found');
    return this._gitService.getConflictDetails(
      repo.ownerUsername,
      repo.name,
      pr.sourceBranch,
      pr.targetBranch,
    );
  }
}
