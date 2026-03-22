import { PullRequestResponseDTO } from 'src/application/dtos/repository/PullRequestDTO';

export interface IMergePRUseCase {
  execute(id: string): Promise<PullRequestResponseDTO>;
}
