import { IPullRequest } from '../../domain/interfaces/IPullRequest';
import { PullRequestResponseDTO } from '../dtos/repository/PullRequestDTO';

export class PullRequestMapper {
  //mongo to domain
  static toIPullRequest(doc: any): IPullRequest {
    return {
      id: doc._id?.toString(),
      title: doc.title,
      description: doc.description,
      status: doc.status,
      sourceBranch: doc.sourceBranch,
      targetBranch: doc.targetBranch,
      repositoryId: doc.repositoryId,
      authorId: doc.authorId,
      authorUsername: doc.authorUsername,
      reviewers: doc.reviewers,
      commentsCount: doc.commentsCount,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  //domain to dto
  static toDTO(pr: IPullRequest): PullRequestResponseDTO {
    return {
      id: pr.id as string,
      title: pr.title,
      description: pr.description,
      status: pr.status,
      sourceBranch: pr.sourceBranch,
      targetBranch: pr.targetBranch,
      repositoryId: pr.repositoryId,
      authorId: pr.authorId,
      authorUsername: pr.authorUsername,
      reviewers: pr.reviewers || [],
      commentsCount: pr.commentsCount,
      createdAt: pr.createdAt,
      updatedAt: pr.updatedAt,
    };
  }
}
