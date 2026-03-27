import { IFollow } from '../IFollow';
import { IBaseRepository } from './IBaseRepository';

export interface IFollowRepository extends IBaseRepository<IFollow> {
  findByFollowerAndFollowing(followerId: string, followingId: string): Promise<IFollow | null>;
  findFollowers(userId: string): Promise<IFollow[]>;
  findFollowing(userId: string): Promise<IFollow[]>;
  deleteByFollowerAndFollowing(followerId: string, followingId: string): Promise<boolean>;
}
