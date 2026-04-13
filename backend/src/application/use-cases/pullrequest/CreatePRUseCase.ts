import { injectable, inject } from 'tsyringe';
import { ICreatePRUseCase } from '../interfaces/pullrequest/ICreatePRUseCase';
import { IPullRequestRepository } from '../../../domain/interfaces/repositories/IPullRequestRepository';
import { PullRequestMapper } from '../../../application/mappers/PullRequestMapper';
import {
  CreatePullRequestDTO,
  PullRequestResponseDTO,
} from '../../../application/dtos/repository/PullRequestDTO';
import { TOKENS } from '../../../shared/constants/tokens';

@injectable()
export class CreatePRUseCase implements ICreatePRUseCase {
  constructor(@inject(TOKENS.IPullRequestRepository) private prRepo: IPullRequestRepository) {}

  async execute(dto: CreatePullRequestDTO): Promise<PullRequestResponseDTO> {
    const totalExistingPRs = await this.prRepo.countPRsByRepo(dto.repositoryId);
    const nextPrNumber = totalExistingPRs + 1;
    const pr = await this.prRepo.save({
      prNumber: nextPrNumber,
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
      baseCommitHash: dto.baseCommitHash,
      headCommitHash: dto.headCommitHash,
    });
    return PullRequestMapper.toDTO(pr);
  }
}
