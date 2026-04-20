import { injectable, inject } from 'tsyringe';
import { IClosePRUseCase } from '../interfaces/pullrequest/IClosePRUseCase';
import { IPullRequestRepository } from '../../../domain/interfaces/repositories/IPullRequestRepository';
import { PullRequestMapper } from '../../../application/mappers/PullRequestMapper';
import { PullRequestResponseDTO } from '../../../application/dtos/repository/PullRequestDTO';
import { TOKENS } from '../../../shared/constants/tokens';
import { PRValidator } from '../validators/PRValidator';
import { NotificationService } from '../../../infrastructure/services/NotificationService';

@injectable()
export class ClosePRUseCase implements IClosePRUseCase {
  constructor(
    @inject(TOKENS.IPullRequestRepository) private _prRepository: IPullRequestRepository,
    @inject(TOKENS.NotificationService) private _notificationService: NotificationService,
  ) {}

  async execute(id: string): Promise<PullRequestResponseDTO> {
    const pr = await PRValidator.findOrFail(this._prRepository, id);
    PRValidator.assertOpen(pr, 'closed');
    const updated = await this._prRepository.update(id, { status: 'closed' });

    this._notificationService
      .notifyRepoDevelopers({
        actorId: pr.authorId,
        actorUsername: pr.authorUsername,
        type: 'pr_closed',
        message: `${pr.authorUsername} closed pull request "${pr.title}"`,
        repositoryId: pr.repositoryId,
        metadata: { prId: pr.id! },
      })
      .catch(() => {});

    return PullRequestMapper.toDTO(updated!);
  }
}
