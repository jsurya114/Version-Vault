import { injectable, inject } from 'tsyringe';
import { IPullRequestRepository } from 'src/domain/interfaces/repositories/IPullRequestRepository';
import { IMergePRUseCase } from '../interfaces/pullrequest/IMergePRUseCase';
import { PullRequestMapper } from 'src/application/mappers/PullRequestMapper';
import { PullRequestResponseDTO } from 'src/application/dtos/repository/PullRequestDTO';
import { TOKENS } from 'src/shared/constants/tokens';
import { NotFoundError } from 'src/domain/errors/NotFoundError';
import { PRValidator } from '../validators/PRValidator';

@injectable()
export class MergePRUseCase implements IMergePRUseCase {
  constructor(
    @inject(TOKENS.IPullRequestRepository) private _prRepository: IPullRequestRepository,
  ) {}
  async execute(id: string): Promise<PullRequestResponseDTO> {
    const pr = await PRValidator.findOrFail(this._prRepository, id);
    PRValidator.assertOpen(pr, 'merged');
    const updated = await this._prRepository.update(id, { status: 'merged' });
    return PullRequestMapper.toDTO(updated!);
  }
}
