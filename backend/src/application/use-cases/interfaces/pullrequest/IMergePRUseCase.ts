import { PullRequestResponseDTO } from '../../../../application/dtos/repository/PullRequestDTO';

export interface IMergePRUseCase {
  execute(id: string): Promise<PullRequestResponseDTO>;
}
