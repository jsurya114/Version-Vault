import { injectable, inject } from 'tsyringe';
import { ICreatePRUseCase } from '../interfaces/pullrequest/ICreatePRUseCase';
import { IPullRequestRepository } from '../../../domain/interfaces/repositories/IPullRequestRepository';
import { PullRequestMapper } from '../../../application/mappers/PullRequestMapper';
import {
  CreatePullRequestDTO,
  PullRequestResponseDTO,
} from '../../../application/dtos/repository/PullRequestDTO';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotificationService } from '../../../infrastructure/services/NotificationService';

@injectable()
export class CreatePRUseCase implements ICreatePRUseCase {
  constructor(
    @inject(TOKENS.IPullRequestRepository) private prRepo: IPullRequestRepository,
    @inject(TOKENS.NotificationService) private _notificationService: NotificationService,
  ) {}

  async execute(dto: CreatePullRequestDTO): Promise<PullRequestResponseDTO> {
    const totalExistingPRs = await this.prRepo.countPRsByRepo(dto.repositoryId);
    const nextPrNumber = totalExistingPRs + 1;
    const pr = await this.prRepo.save({
      prNumber: nextPrNumber,
      title: dto.title,
      description: dto.description,
      status: 'open',
      sourceBranch: dto.sourceBranch,
      targetBranch: dto.targetBranch,
      repositoryId: dto.repositoryId,
      authorId: dto.authorId,
      authorUsername: dto.authorUsername,
      reviewers: [],
      commentsCount: 0,
      baseCommitHash: dto.baseCommitHash,
      headCommitHash: dto.headCommitHash,
    });
    this._notificationService
      .notifyRepoDevelopers({
        actorId: dto.authorId,
        actorUsername: dto.authorUsername,
        type: 'pr_created',
        message: `${dto.authorUsername} opened pull request "${dto.title}"`,
        repositoryId: dto.repositoryId,
        metadata: { prId: pr.id! },
      })
      .catch(() => {});

    return PullRequestMapper.toDTO(pr);
  }
}
