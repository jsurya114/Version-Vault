import { CreateIssueDTO } from '../../../../application/dtos/repository/IssuesDTO';
import { IssuesResponseDTO } from '../../../../application/dtos/repository/IssuesDTO';

export interface ICreateIssueUseCase {
  execute(dto: CreateIssueDTO): Promise<IssuesResponseDTO>;
}
