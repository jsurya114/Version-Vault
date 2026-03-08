import { injectable } from 'tsyringe';
import { IUserRepository } from 'src/domain/interfaces/repositories/IUserRepository';
import { IUser } from 'src/domain/interfaces/IUser';
import { UserModel } from '../models/UserModel';
import { UserMapper } from 'src/application/mappers/UserMapper';

@injectable()
export class MongoUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    const user = await UserModel.findOne({ email }).lean();

    if (!user) return null;
    return UserMapper.toIUser(user);
  }

  async findById(id: string): Promise<IUser | null> {
    const user = await UserModel.findById(id).lean();
    if (!user) return null;
    return UserMapper.toIUser(user);
  }

  async findByUserId(identifier: string): Promise<IUser | null> {
    const user = await UserModel.findOne({
      $or: [{ userId: identifier }, { username: identifier }, { email: identifier }],
    }).lean();
    if (!user) return null;
    return UserMapper.toIUser(user);
  }
  async findByUserName(username: string): Promise<IUser | null> {
    const user = await UserModel.findOne({ username }).lean();
    if (!user) return null;
    return UserMapper.toIUser(user);
  }

  async save(user: IUser): Promise<IUser> {
    const created = await UserModel.create(user);
    return UserMapper.toIUser(created.toObject());
  }
  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    const updated = await UserModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!updated) return null;
    return UserMapper.toIUser(updated);
  }
  async delete(id: string): Promise<void> {
    await UserModel.findByIdAndDelete(id);
  }
}
