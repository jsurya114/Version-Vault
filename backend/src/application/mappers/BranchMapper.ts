import { IBranch } from '../../domain/interfaces/IBranch';

export class BranchMapper {
  static toEntity(doc: unknown): IBranch {
    const d = doc as IBranch & { _id?: { toString(): string } };
    return {
      repositoryId: d.repositoryId,
      branchName: d.branchName,
      createdBy: d.createdBy,
      createdAt: d.createdAt,
    };
  }
}
