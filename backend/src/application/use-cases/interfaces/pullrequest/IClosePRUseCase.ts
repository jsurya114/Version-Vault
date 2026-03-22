import { PullRequestResponseDTO } from 'src/application/dtos/repository/PullRequestDTO';

export interface IClosePRUseCase {
  execute(id: string): Promise<PullRequestResponseDTO>;
}
