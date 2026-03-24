import { injectable, inject } from 'tsyringe';
import { IClosePRUseCase } from '../interfaces/pullrequest/IClosePRUseCase';
import { IPullRequestRepository } from '../../../domain/interfaces/repositories/IPullRequestRepository';
import { PullRequestMapper } from '../../../application/mappers/PullRequestMapper';
import { PullRequestResponseDTO } from '../../../application/dtos/repository/PullRequestDTO';
import { TOKENS } from '../../../shared/constants/tokens';
import { PRValidator } from '../validators/PRValidator';

@injectable()
export class ClosePRUseCase implements IClosePRUseCase {
  constructor(
    @inject(TOKENS.IPullRequestRepository) private _prRepository: IPullRequestRepository,
  ) {}

  async execute(id: string): Promise<PullRequestResponseDTO> {
    const pr = await PRValidator.findOrFail(this._prRepository, id);
    PRValidator.assertOpen(pr, 'closed');
    const updated = await this._prRepository.update(id, { status: 'closed' });
    return PullRequestMapper.toDTO(updated!);
  }
}
