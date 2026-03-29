import { RepoResponseDTO } from '../../../../application/dtos/repository/RepoResponseDTO';

export interface IBlockRepoUseCase {
  execute(id: string): Promise<RepoResponseDTO>;
}
