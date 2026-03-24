import { injectable, inject } from 'tsyringe';
import { IGetPRUseCase } from '../interfaces/pullrequest/IGetPRUseCase';
import { IPullRequestRepository } from '../../../domain/interfaces/repositories/IPullRequestRepository';
import { PullRequestMapper } from '../../../application/mappers/PullRequestMapper';
import { PullRequestResponseDTO } from '../../../application/dtos/repository/PullRequestDTO';
import { TOKENS } from '../../../shared/constants/tokens';
import { PRValidator } from '../validators/PRValidator';

@injectable()
export class GetPRUseCase implements IGetPRUseCase {
  constructor(
    @inject(TOKENS.IPullRequestRepository) private _prRepository: IPullRequestRepository,
  ) {}

  async execute(id: string): Promise<PullRequestResponseDTO> {
    const pr = await PRValidator.findOrFail(this._prRepository, id);

    return PullRequestMapper.toDTO(pr);
  }
}
