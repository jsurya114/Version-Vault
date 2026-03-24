import { IPullRequest } from '../../../domain/interfaces/IPullRequest';
import { IPullRequestRepository } from '../../../domain/interfaces/repositories/IPullRequestRepository';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
export class PRValidator {
  static async findOrFail(prRepository: IPullRequestRepository, id: string): Promise<IPullRequest> {
    const pr = await prRepository.findById(id);
    if (!pr) throw new NotFoundError('Pull request not found');
    return pr;
  }

  static assertOpen(pr: IPullRequest, action: string): void {
    if (pr.status !== 'open') {
      throw new Error(`Only open pull requests can be ${action}`);
    }
  }
}
