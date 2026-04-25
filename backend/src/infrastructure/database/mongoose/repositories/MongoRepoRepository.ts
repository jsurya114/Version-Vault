import mongoose from 'mongoose';
import { injectable } from 'tsyringe';
import { RepositoryModel } from '../models/RepositoryModel';
import { CollaboratorModel } from '../models/CollaboratorModel';
import { IRepoRepository } from '../../../../domain/interfaces/repositories/IRepoRepository';
import { RepositoryMapper } from '../../../../application/mappers/RepositoryMapper';
import { IRepository } from '../../../../domain/interfaces/IRepository';
import { MongoBaseRepository } from './MongoBaseRepository';
import {
  PaginationQueryDTO,
  PaginatedResponseDTO,
} from '../../../../application/dtos/reusable/PaginationDTO';

@injectable()
export class MongoRepoRepository
  extends MongoBaseRepository<IRepository>
  implements IRepoRepository
{
  constructor() {
    super(RepositoryModel);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected toEntity(doc: any): IRepository {
    return RepositoryMapper.toIRepository(doc);
  }

  async findByOwner(
    ownerId: string,
    query: PaginationQueryDTO,
    authenticatedUserId?: string,
  ): Promise<PaginatedResponseDTO<IRepository>> {
    const filter: Record<string, unknown> = { ownerId, isDeleted: false, isBlocked: false };
    if (ownerId !== authenticatedUserId) {
      filter.visibility = 'public';
    }

    if (query.search) {
      filter.name = { $regex: query.search, $options: 'i' };
    }

    if (query.status) {
      filter.visibility = query.status;
    }

    return this.findWithpagination(filter, query);
  }
  async findByOwnerAndName(ownerUsername: string, name: string): Promise<IRepository | null> {
    const doc = await this.model
      .findOne({ ownerUsername, name, isDeleted: false, isBlocked: false })
      .lean();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findAll(query: PaginationQueryDTO): Promise<PaginatedResponseDTO<IRepository>> {
    const filter: Record<string, unknown> = { isDeleted: false, isBlocked: false };

    if (query.search) {
      filter.name = { $regex: query.search, $options: 'i' };
    }

    if (query.status) {
      filter.visibility = query.status;
    }
    return this.findWithpagination(filter, query);
  }
  async findUserRepositories(
    userId: string,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<IRepository>> {
    // 1. Get collaborator repo IDs and roles
    const collaborations = await CollaboratorModel.find({ collaboratorId: userId }).lean();
    const collabMap = new Map(collaborations.map((c) => [c.repositoryId, c.role]));
    const collabRepoIds = Array.from(collabMap.keys())
      .map((id) => {
        try {
          return new mongoose.Types.ObjectId(id);
        } catch {
          return null;
        }
      })
      .filter((id) => id !== null);

    // 2. Build filter for Owned OR Collaborated
    const filter: Record<string, unknown> = {
      isDeleted: false,
      isBlocked: false,
    };

    const type = query.type;
    if (type === 'owned') {
      filter.ownerId = userId;
    } else if (type === 'collab') {
      filter._id = { $in: collabRepoIds };
    } else {
      // Default: show both
      filter.$or = [{ ownerId: userId }, { _id: { $in: collabRepoIds } }];
    }

    if (query.search) {
      filter.name = { $regex: query.search, $options: 'i' };
    }

    if (query.status) {
      filter.visibility = query.status;
    }

    const result = await this.findWithpagination(filter, query);

    // 3. Assign roles
    result.data = result.data.map((repo) => {
      const repoIdStr = repo.id?.toString();
      // Ensure we compare strings
      if (String(repo.ownerId) === String(userId)) {
        repo.role = 'owner';
      } else if (repoIdStr && collabMap.has(repoIdStr)) {
        repo.role = collabMap.get(repoIdStr);
      }
      return repo;
    });

    return result;
  }
}
