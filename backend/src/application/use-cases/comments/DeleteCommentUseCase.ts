import { injectable, inject } from 'tsyringe';
import { ICommentRepository } from '../../../domain/interfaces/repositories/ICommentRepository';
import { TOKENS } from '../../../shared/constants/tokens';
import { IDeleteCommentUseCase } from '../interfaces/comments/IDeleteCommentUseCase';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { UnauthorizedError } from '../../../domain/errors/UnauthorizedError';
import { IIssueRepository } from '../../../domain/interfaces/repositories/IIssuesRepository';
import { IPullRequestRepository } from '../../../domain/interfaces/repositories/IPullRequestRepository';

@injectable()
export class DeleteCommentUseCase implements IDeleteCommentUseCase {
  constructor(
    @inject(TOKENS.ICommentRepository) private _commentRepo: ICommentRepository,
    @inject(TOKENS.IIssuesRepository) private _issueRepo: IIssueRepository,
    @inject(TOKENS.IPullRequestRepository) private _prRepo: IPullRequestRepository,
  ) {}

  async execute(commentId: string, requestUserId: string): Promise<boolean> {
    const comment = await this._commentRepo.findById(commentId);
    if (!comment) throw new NotFoundError('Comment not found');

    if (comment.authorId.toString() !== requestUserId) {
      throw new UnauthorizedError('Unauthorized to delete this comment');
    }

    const success = await this._commentRepo.delete(commentId);

    if (success) {
      if (comment.targetType === 'issue') {
        const issue = await this._issueRepo.findById(comment.targetId);
        if (issue) {
          await this._issueRepo.update(comment.targetId, {
            commentsCount: Math.max(0, (issue.commentsCount || 0) - 1),
          });
        }
      } else if (comment.targetType === 'pr') {
        const pr = await this._prRepo.findById(comment.targetId);
        if (pr) {
          await this._prRepo.update(comment.targetId, {
            commentsCount: Math.max(0, (pr.commentsCount || 0) - 1),
          });
        }
      }
    }

    return success;
  }
}
