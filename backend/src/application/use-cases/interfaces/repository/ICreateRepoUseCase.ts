import { CreateRepoDTO } from '../../../../application/dtos/repository/CreateRepoDTO';
import { RepoResponseDTO } from '../../../../application/dtos/repository/RepoResponseDTO';

export interface ICreateRepoUseCase {
  execute(dto: CreateRepoDTO): Promise<RepoResponseDTO>;
}
