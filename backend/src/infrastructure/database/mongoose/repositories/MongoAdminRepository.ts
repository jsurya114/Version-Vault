import { IUser } from '../../../../domain/interfaces/IUser';
import { UserModel } from '../models/UserModel';
import { UserMapper } from '../../../../application/mappers/UserMapper';
import { injectable } from 'tsyringe';
import { IAdminRepository } from '../../../../domain/interfaces/repositories/IAdminRepository';
import { MongoBaseRepository } from './MongoBaseRepository';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../../application/dtos/reusable/PaginationDTO';
import { UserRole } from '../../../../domain/enums';

@injectable()
export class MongoAdminRepository extends MongoBaseRepository<IUser> implements IAdminRepository {
  constructor() {
    super(UserModel);
  }
  protected toEntity(doc: any): IUser {
    return UserMapper.toIUser(doc);
  }

  async getAllUsers(query: PaginationQueryDTO): Promise<PaginatedResponseDTO<IUser>> {
    const filter: Record<string, any> = {
      role: { $ne: UserRole.ADMIN },
    };
    if (query.search) {
      filter.$or = [
        { username: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { userId: { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.status === 'blocked') filter.isBlocked = true;
    if (query.status === 'active') {
      filter.isBlocked = false;
      filter.isVerified = true;
    }
    if (query.status === 'pending') filter.isVerified = false;
    return this.findWithpagination(filter, query);
  }
  async getUserById(id: string): Promise<IUser | null> {
    return this.findById(id);
  }
  async blockUser(id: string): Promise<IUser | null> {
    return this.update(id, { isBlocked: true });
  }

  async unblockUser(id: string): Promise<IUser | null> {
    return this.update(id, { isBlocked: false });
  }
}
