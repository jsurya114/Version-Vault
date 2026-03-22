import { PullRequestResponseDTO } from 'src/application/dtos/repository/PullRequestDTO';

export interface IGetPRUseCase {
  execute(id: string): Promise<PullRequestResponseDTO>;
}
