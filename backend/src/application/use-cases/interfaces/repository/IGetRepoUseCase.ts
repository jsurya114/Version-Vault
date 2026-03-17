import { RepoResponseDTO } from 'src/application/dtos/repository/RepoResponseDTO';

export interface IGetRepoUseCase {
  execute(ownerUsername: string, name: string): Promise<RepoResponseDTO>;
}
