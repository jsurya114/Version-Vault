import { RepoResponseDTO } from '../../../../application/dtos/repository/RepoResponseDTO';

export interface IUnblockRepoUseCase {
  execute(id: string): Promise<RepoResponseDTO>;
}
