import { IWorkflowRun } from '../../../../domain/interfaces/ICICD';

export interface IListWorkflowRunsUseCase {
  execute(repositoryId: string): Promise<IWorkflowRun[]>;
}
