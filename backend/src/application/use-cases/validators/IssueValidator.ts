import { IIssue } from '../../../domain/interfaces/IIssues';
import { IIssueRepository } from '../../../domain/interfaces/repositories/IIssuesRepository';

export class IssueValidator {
  static async findOrFail(_issueRepo: IIssueRepository, id: string): Promise<IIssue> {
    const issue = await _issueRepo.findById(id);
    if (!issue) throw new Error('Issue not found');
    return issue;
  }

  static assertOpen(issue: IIssue): void {
    if (issue.status !== 'open') {
      throw new Error('Only open issues can be closed');
    }
  }
}
