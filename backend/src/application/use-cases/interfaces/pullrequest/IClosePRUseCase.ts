import { PullRequestResponseDTO } from '../../../../application/dtos/repository/PullRequestDTO';

export interface IClosePRUseCase {
  execute(id: string): Promise<PullRequestResponseDTO>;
}
