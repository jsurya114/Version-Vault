import { injectable, inject } from 'tsyringe';
import { ICreateCommentUseCase } from '../interfaces/comments/ICreateCommentUsecase';
import {
  CommentResponseDTO,
  CreateCommentDTO,
} from '../../../application/dtos/repository/CommentDTO';
import { IIssueRepository } from '../../../domain/interfaces/repositories/IIssuesRepository';
import { IPullRequestRepository } from '../../../domain/interfaces/repositories/IPullRequestRepository';
import { ICommentRepository } from '../../../domain/interfaces/repositories/ICommentRepository';
import { TOKENS } from '../../../shared/constants/tokens';
import { CommentMapper } from '../../../application/mappers/CommentMapper';
import { NotificationService } from '../../../infrastructure/services/NotificationService';

@injectable()
export class CreateCommentUseCase implements ICreateCommentUseCase {
  constructor(
    @inject(TOKENS.ICommentRepository) private _commentRepo: ICommentRepository,
    @inject(TOKENS.IIssuesRepository) private _issueRepo: IIssueRepository,
    @inject(TOKENS.IPullRequestRepository) private _prRepo: IPullRequestRepository,
    @inject(TOKENS.NotificationService) private _notificationService: NotificationService,
  ) {}
  async execute(dto: CreateCommentDTO): Promise<CommentResponseDTO> {
    const comment = await this._commentRepo.save({
      targetId: dto.targetId,
      targetType: dto.targetType,
      repositoryId: dto.repositoryId,
      authorId: dto.authorId,
      authorUsername: dto.authorUsername,
      content: dto.content,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(),
    });

    if (dto.targetType === 'issue') {
      const issue = await this._issueRepo.findById(dto.targetId);
      if (issue) {
        await this._issueRepo.update(dto.targetId, {
          commentsCount: (issue.commentsCount || 0) + 1,
        });
      }
    } else if (dto.targetType === 'pr') {
      const pr = await this._prRepo.findById(dto.targetId);
      if (pr) {
        await this._prRepo.update(dto.targetId, {
          commentsCount: (pr.commentsCount || 0) + 1,
        });
      }
    }

    // Send mention notifications for @username in comment content
    if (dto.content) {
      let contextTitle = '';
      if (dto.targetType === 'issue') {
        const issue = await this._issueRepo.findById(dto.targetId);
        contextTitle = issue?.title || 'an issue';
      } else if (dto.targetType === 'pr') {
        const pr = await this._prRepo.findById(dto.targetId);
        contextTitle = pr?.title || 'a pull request';
      }

      this._notificationService
        .notifyMentionedUsers({
          text: dto.content,
          actorId: dto.authorId,
          actorUsername: dto.authorUsername,
          repositoryId: dto.repositoryId,
          contextType: 'comment',
          contextTitle,
        })
        .catch(() => {});
    }

    return CommentMapper.toResponseDTO(comment);
  }
}
