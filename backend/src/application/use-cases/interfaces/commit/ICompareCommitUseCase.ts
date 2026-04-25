import { CompareResponse } from '../../../../domain/interfaces/IGitTypes';
export interface ICompareCommitUseCase {
  execute(username: string, reponame: string, base: string, head: string): Promise<CompareResponse>;
}
