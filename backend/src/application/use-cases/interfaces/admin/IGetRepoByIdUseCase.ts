import { RepoResponseDTO } from '../../../../application/dtos/repository/RepoResponseDTO';
export interface IGetRepoByIdUseCase {
  execute(id: string): Promise<RepoResponseDTO>;
}
