import {
  CreatePullRequestDTO,
  PullRequestResponseDTO,
} from '../../../../application/dtos/repository/PullRequestDTO';

export interface ICreatePRUseCase {
  execute(dto: CreatePullRequestDTO): Promise<PullRequestResponseDTO>;
}
