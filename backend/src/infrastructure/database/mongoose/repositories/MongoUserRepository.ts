import { injectable } from 'tsyringe';
import { UserModel } from '../models/UserModel';
import { UserMapper } from 'src/application/mappers/UserMapper';
import { IUserRepository } from 'src/domain/interfaces/repositories/IUserRepository';
import { IUser } from 'src/domain/interfaces/IUser';
import { MongoBaseRepository } from './MongoBaseRepository';

@injectable()
export class MongoUserRepository extends MongoBaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(UserModel);
  }

  protected toEntity(doc: any): IUser {
    return UserMapper.toIUser(doc);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const doc = await this.model.findOne({ email }).lean();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findByUserId(userId: string): Promise<IUser | null> {
    const doc = await this.model.findOne({ userId }).lean();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findByUserName(username: string): Promise<IUser | null> {
    const doc = await this.model.findOne({ username }).lean();
    if (!doc) return null;
    return this.toEntity(doc);
  }
}
