import { injectable, inject } from 'tsyringe';
import { ICreatePRUseCase } from '../interfaces/pullrequest/ICreatePRUseCase';
import { IPullRequestRepository } from 'src/domain/interfaces/repositories/IPullRequestRepository';
import { PullRequestMapper } from 'src/application/mappers/PullRequestMapper';
import {
  CreatePullRequestDTO,
  PullRequestResponseDTO,
} from 'src/application/dtos/repository/PullRequestDTO';
import { TOKENS } from 'src/shared/constants/tokens';

@injectable()
export class CreatePRUseCase implements ICreatePRUseCase {
  constructor(@inject(TOKENS.IPullRequestRepository) private prRepo: IPullRequestRepository) {}

  async execute(dto: CreatePullRequestDTO): Promise<PullRequestResponseDTO> {
    const pr = await this.prRepo.save({
      title: dto.title,
      description: dto.description,
      status: 'open',
      sourceBranch: dto.sourceBranch,
      targetBranch: dto.targetBranch,
      repositoryId: dto.repositoryId,
      authorId: dto.authorId,
      authorUsername: dto.authorUsername,
      reviewers: [],
      commentsCount: 0,
    });
    return PullRequestMapper.toDTO(pr);
  }
}
