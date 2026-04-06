import { RepoResponseDTO } from '../../../../application/dtos/repository/RepoResponseDTO';
import { ForkRepoDTO } from '../../../../application/dtos/repository/ForkDTO';

export interface IForkRepoUseCase {
  execute(dto: ForkRepoDTO): Promise<RepoResponseDTO>;
}
