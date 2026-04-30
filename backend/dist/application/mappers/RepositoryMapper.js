"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryMapper = void 0;
class RepositoryMapper {
    //mongo to domain
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static toIRepository(doc) {
        return {
            id: doc._id?.toString(),
            name: doc.name,
            description: doc.description,
            visibility: doc.visibility,
            ownerId: doc.ownerId,
            ownerUsername: doc.ownerUsername,
            defaultBranch: doc.defaultBranch,
            stars: doc.stars,
            forks: doc.forks,
            size: doc.size,
            isDeleted: doc.isDeleted,
            isBlocked: doc.isBlocked,
            isFork: doc.isFork,
            parentRepoId: doc.parentRepoId,
            parentRepoOwnerUsername: doc.parentRepoOwnerUsername,
            starredBy: doc.starredBy || [],
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            role: doc.role,
        };
    }
    //domain to dto
    static toDTO(repo) {
        return {
            id: repo.id,
            name: repo.name,
            description: repo.description,
            visibility: repo.visibility,
            ownerId: repo.ownerId,
            ownerUsername: repo.ownerUsername,
            defaultBranch: repo.defaultBranch,
            stars: repo.stars,
            forks: repo.forks,
            size: repo.size,
            isBlocked: repo.isBlocked,
            isFork: repo.isFork,
            parentRepoOwnerUsername: repo.parentRepoOwnerUsername,
            starredBy: repo.starredBy || [],
            createdAt: repo.createdAt,
            updatedAt: repo.updatedAt,
            role: repo.role,
        };
    }
}
exports.RepositoryMapper = RepositoryMapper;
