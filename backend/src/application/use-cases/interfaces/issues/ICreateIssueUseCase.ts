import { CreateIssueDTO } from 'src/application/dtos/repository/IssuesDTO';
import { IssuesResponseDTO } from 'src/application/dtos/repository/IssuesDTO';

export interface ICreateIssueUseCase {
  execute(dto: CreateIssueDTO): Promise<IssuesResponseDTO>;
}
