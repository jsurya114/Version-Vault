import { injectable, inject } from 'tsyringe';
import { ICloseIssueUseCase } from '../use-cases/interfaces/issues/ICloseIssueUseCase';
import { IIssueRepository } from '../../domain/interfaces/repositories/IIssuesRepository';
import { IssueMapper } from '../mappers/IssuesMapper';
import { IssuesResponseDTO } from '../dtos/repository/IssuesDTO';
import { TOKENS } from '../../shared/constants/tokens';
import { IssueValidator } from '../use-cases/validators/IssueValidator';

@injectable()
export class CloseIssueUseCase implements ICloseIssueUseCase {
  constructor(@inject(TOKENS.IIssuesRepository) private _issueRepo: IIssueRepository) {}

  async execute(id: string): Promise<IssuesResponseDTO> {
    const issue = await IssueValidator.findOrFail(this._issueRepo, id);
    IssueValidator.assertOpen(issue);
    const updated = await this._issueRepo.update(id, { status: 'closed' });
    return IssueMapper.toDTO(updated!);
  }
}
