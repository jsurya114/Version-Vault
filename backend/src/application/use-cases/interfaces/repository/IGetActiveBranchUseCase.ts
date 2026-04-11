import { ActiveBranchDTO } from '../../../../application/dtos/repository/ActiveBranchDTO';
export interface IGetActiveBranchUseCase {
  execute(ownerUsername: string, repoName: string): Promise<ActiveBranchDTO[]>;
}
