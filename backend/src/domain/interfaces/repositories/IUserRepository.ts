import type { IUser } from '../IUser';
import { IBaseRepository } from './IBaseRepository';

export interface IUserRepository extends IBaseRepository<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findByUserId(userId: string): Promise<IUser | null>;
  findByUserName(username: string): Promise<IUser | null>;
  findManyByIds(ids: string[]): Promise<IUser[]>;
}
