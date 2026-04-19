import { injectable, inject } from 'tsyringe';
import { ICloseIssueUseCase } from '../use-cases/interfaces/issues/ICloseIssueUseCase';
import { IIssueRepository } from '../../domain/interfaces/repositories/IIssuesRepository';
import { IssueMapper } from '../mappers/IssuesMapper';
import { IssuesResponseDTO } from '../dtos/repository/IssuesDTO';
import { TOKENS } from '../../shared/constants/tokens';
import { IssueValidator } from '../use-cases/validators/IssueValidator';
import { NotificationService } from '../../infrastructure/services/NotificationService';

@injectable()
export class CloseIssueUseCase implements ICloseIssueUseCase {
  constructor(
    @inject(TOKENS.IIssuesRepository) private _issueRepo: IIssueRepository,
    @inject(TOKENS.NotificationService) private _notificationService: NotificationService,
  ) {}

  async execute(id: string): Promise<IssuesResponseDTO> {
    const issue = await IssueValidator.findOrFail(this._issueRepo, id);
    IssueValidator.assertOpen(issue);
    const updated = await this._issueRepo.update(id, { status: 'closed' });

    this._notificationService
      .notifyRepoDevelopers({
        actorId: issue.authorId,
        actorUsername: issue.authorUsername,
        type: 'issue_closed',
        message: `${issue.authorUsername} closed issue "${issue.title}"`,
        repositoryId: issue.repositoryId,
        metadata: { issueId: issue.id! },
      })
      .catch(() => {});

    return IssueMapper.toDTO(updated!);
  }
}
