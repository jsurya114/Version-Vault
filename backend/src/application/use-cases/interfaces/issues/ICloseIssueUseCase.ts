import { IssuesResponseDTO } from 'src/application/dtos/repository/IssuesDTO';

export interface ICloseIssueUseCase {
  execute(id: string): Promise<IssuesResponseDTO>;
}
