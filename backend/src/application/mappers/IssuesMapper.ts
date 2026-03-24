import { IssuesResponseDTO } from '../dtos/repository/IssuesDTO';
import { IIssue } from '../../domain/interfaces/IIssues';

export class IssueMapper {
  static toIIssues(doc: any): IIssue {
    return {
      id: doc._id?.toString(),
      title: doc.title,
      description: doc.description,
      status: doc.status,
      priority: doc.priority,
      repositoryId: doc.repositoryId,
      authorId: doc.authorId,
      authorUsername: doc.authorUsername,
      assignees: doc.assignees,
      labels: doc.labels,
      commentsCount: doc.commentsCount,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static toDTO(issue: IIssue): IssuesResponseDTO {
    return {
      id: issue.id as string,
      title: issue.title,
      description: issue.description,
      status: issue.status,
      priority: issue.priority,
      repositoryId: issue.repositoryId,
      authorId: issue.authorId,
      authorUsername: issue.authorUsername,
      assignees: issue.assignees || [],
      labels: issue.labels || [],
      commentsCount: issue.commentsCount,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
    };
  }
}
