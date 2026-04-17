import {
  PullRequestResponseDTO,
  ResolveConflictsInput,
} from '../../../../application/dtos/repository/PullRequestDTO';

export interface IResolveConflictsUseCase {
  execute(input: ResolveConflictsInput): Promise<PullRequestResponseDTO>;
}
