import { injectable, inject } from 'tsyringe';
import { ICreateIssueUseCase } from '../use-cases/interfaces/issues/ICreateIssueUseCase';
import { IIssueRepository } from '../../domain/interfaces/repositories/IIssuesRepository';
import { IssueMapper } from '../mappers/IssuesMapper';
import { CreateIssueDTO, IssuesResponseDTO } from '../dtos/repository/IssuesDTO';
import { TOKENS } from '../../shared/constants/tokens';
import { NotificationService } from '../../infrastructure/services/NotificationService';

@injectable()
export class CreateIssueUseCase implements ICreateIssueUseCase {
  constructor(
    @inject(TOKENS.IIssuesRepository) private _issueRepo: IIssueRepository,
    @inject(TOKENS.NotificationService) private _notificationService: NotificationService,
  ) {}

  async execute(dto: CreateIssueDTO): Promise<IssuesResponseDTO> {
    const issue = await this._issueRepo.save({
      title: dto.title,
      description: dto.description,
      status: 'open',
      priority: dto.priority || 'medium',
      repositoryId: dto.repositoryId,
      authorId: dto.authorId,
      authorUsername: dto.authorUsername,
      assignees: [],
      labels: dto.labels || [],
      commentsCount: 0,
    });

    this._notificationService
      .notifyRepoDevelopers({
        actorId: dto.authorId,
        actorUsername: dto.authorUsername,
        type: 'issue_created',
        message: `${dto.authorUsername} opened issue "${dto.title}"`,
        repositoryId: dto.repositoryId,
        metadata: { issueId: issue.id! },
      })
      .catch(() => {});

    return IssueMapper.toDTO(issue);
  }
}
