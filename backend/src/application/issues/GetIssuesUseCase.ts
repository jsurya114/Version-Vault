import { injectable, inject } from 'tsyringe';
import { IGetIssueUseCase } from '../use-cases/interfaces/issues/IGetIssueUseCase';
import { IssueMapper } from '../mappers/IssuesMapper';
import { IssuesResponseDTO } from '../dtos/repository/IssuesDTO';
import { IIssueRepository } from 'src/domain/interfaces/repositories/IIssuesRepository';
import { TOKENS } from 'src/shared/constants/tokens';
import { NotFoundError } from 'src/domain/errors/NotFoundError';
import { IssueValidator } from '../use-cases/validators/IssueValidator';

@injectable()
export class GetIssueUseCase implements IGetIssueUseCase {
  constructor(@inject(TOKENS.IIssuesRepository) private _issueRepo: IIssueRepository) {}

  async execute(id: string): Promise<IssuesResponseDTO> {
    const issue = await IssueValidator.findOrFail(this._issueRepo, id);
    return IssueMapper.toDTO(issue);
  }
}
