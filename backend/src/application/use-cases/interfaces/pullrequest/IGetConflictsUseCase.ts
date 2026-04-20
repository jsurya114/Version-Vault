import { ConflictDetails } from '../../../../domain/interfaces/IGitTypes';

export interface IGetConflictsUseCase {
  execute(prId: string): Promise<ConflictDetails>;
}
