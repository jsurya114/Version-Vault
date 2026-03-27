import { injectable, inject } from 'tsyringe';
import { ICreateIssueUseCase } from '../use-cases/interfaces/issues/ICreateIssueUseCase';
import { IIssueRepository } from '../../domain/interfaces/repositories/IIssuesRepository';
import { IssueMapper } from '../mappers/IssuesMapper';
import { CreateIssueDTO, IssuesResponseDTO } from '../dtos/repository/IssuesDTO';
import { TOKENS } from '../../shared/constants/tokens';

@injectable()
export class CreateIssueUseCase implements ICreateIssueUseCase {
  constructor(@inject(TOKENS.IIssuesRepository) private _issueRepo: IIssueRepository) {}

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

    return IssueMapper.toDTO(issue);
  }
}
