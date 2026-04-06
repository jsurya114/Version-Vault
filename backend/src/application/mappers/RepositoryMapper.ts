import { IRepository } from '../../domain/interfaces/IRepository';
import { RepoResponseDTO } from '../dtos/repository/RepoResponseDTO';

export class RepositoryMapper {
  //mongo to domain
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static toIRepository(doc: any): IRepository {
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
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  //domain to dto
  static toDTO(repo: IRepository): RepoResponseDTO {
    return {
      id: repo.id as string,
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
      createdAt: repo.createdAt,
      updatedAt: repo.updatedAt,
    };
  }
}
