import { IssuesResponseDTO } from '../../../../application/dtos/repository/IssuesDTO';

export interface ICloseIssueUseCase {
  execute(id: string): Promise<IssuesResponseDTO>;
}
