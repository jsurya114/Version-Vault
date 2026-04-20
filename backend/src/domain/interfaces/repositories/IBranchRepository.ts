import { IBranch } from '../IBranch';
import { IBaseRepository } from './IBaseRepository';

export interface IBranchRepository extends IBaseRepository<IBranch> {
  findByRepoAndBranch(repositoryId: string, branchName: string): Promise<IBranch | null>;
  deleteByRepoAndBranch(repositoryId: string, branchName: string): Promise<boolean>;
}
