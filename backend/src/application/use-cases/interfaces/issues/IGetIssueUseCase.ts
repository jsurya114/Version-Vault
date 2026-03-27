import { IssuesResponseDTO } from '../../../../application/dtos/repository/IssuesDTO';

export interface IGetIssueUseCase {
  execute(id: string): Promise<IssuesResponseDTO>;
}
