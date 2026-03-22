import { IssuesResponseDTO } from 'src/application/dtos/repository/IssuesDTO';

export interface IGetIssueUseCase {
  execute(id: string): Promise<IssuesResponseDTO>;
}
