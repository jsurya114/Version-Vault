import {
  CreatePullRequestDTO,
  PullRequestResponseDTO,
} from 'src/application/dtos/repository/PullRequestDTO';

export interface ICreatePRUseCase {
  execute(dto: CreatePullRequestDTO): Promise<PullRequestResponseDTO>;
}
