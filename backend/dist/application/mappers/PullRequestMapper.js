"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PullRequestMapper = void 0;
class PullRequestMapper {
    //mongo to domain
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static toIPullRequest(doc) {
        return {
            id: doc._id?.toString(),
            title: doc.title,
            description: doc.description,
            prNumber: doc.prNumber,
            status: doc.status,
            mergeApproval: doc.mergeApproval || 'none',
            sourceBranch: doc.sourceBranch,
            targetBranch: doc.targetBranch,
            repositoryId: doc.repositoryId,
            authorId: doc.authorId,
            authorUsername: doc.authorUsername,
            reviewers: doc.reviewers,
            commentsCount: doc.commentsCount,
            baseCommitHash: doc.baseCommitHash,
            headCommitHash: doc.headCommitHash,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }
    //domain to dto
    static toDTO(pr) {
        return {
            id: pr.id,
            title: pr.title,
            description: pr.description,
            prNumber: pr.prNumber,
            status: pr.status,
            mergeApproval: pr.mergeApproval,
            sourceBranch: pr.sourceBranch,
            targetBranch: pr.targetBranch,
            repositoryId: pr.repositoryId,
            authorId: pr.authorId,
            authorUsername: pr.authorUsername,
            reviewers: pr.reviewers || [],
            commentsCount: pr.commentsCount,
            baseCommitHash: pr.baseCommitHash,
            headCommitHash: pr.headCommitHash,
            createdAt: pr.createdAt,
            updatedAt: pr.updatedAt,
        };
    }
}
exports.PullRequestMapper = PullRequestMapper;
