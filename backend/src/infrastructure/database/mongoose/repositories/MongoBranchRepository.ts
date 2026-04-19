import { injectable } from 'tsyringe';
import { MongoBaseRepository } from './MongoBaseRepository';
import { IBranchRepository } from '../../../../domain/interfaces/repositories/IBranchRepository';
import { IBranch } from '../../../../domain/interfaces/IBranch';
import { BranchModel } from '../models/BranchModel';
import { BranchMapper } from '../../../../application/mappers/BranchMapper';

@injectable()
export class MongoBranchRepository
  extends MongoBaseRepository<IBranch>
  implements IBranchRepository
{
  constructor() {
    super(BranchModel);
  }

  protected toEntity(doc: unknown): IBranch {
    return BranchMapper.toEntity(doc);
  }

  async findByRepoAndBranch(repositoryId: string, branchName: string): Promise<IBranch | null> {
    const doc = await this.model.findOne({ repositoryId, branchName });
    return doc ? this.toEntity(doc) : null;
  }

  async deleteByRepoAndBranch(repositoryId: string, branchName: string): Promise<boolean> {
    const result = await this.model.deleteOne({ repositoryId, branchName });
    return result.deletedCount > 0;
  }
}
