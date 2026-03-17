import { CreateRepoDTO } from 'src/application/dtos/repository/CreateRepoDTO';
import { RepoResponseDTO } from 'src/application/dtos/repository/RepoResponseDTO';

export interface ICreateRepoUseCase {
  execute(dto: CreateRepoDTO): Promise<RepoResponseDTO>;
}
