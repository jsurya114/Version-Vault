import { PullRequestResponseDTO } from '../../../../application/dtos/repository/PullRequestDTO';

export interface IGetPRUseCase {
  execute(id: string): Promise<PullRequestResponseDTO>;
}
