import { IWorkflowRun } from '../../../../domain/interfaces/ICICD';

export interface IGetWorkflowRunUseCase {
  execute(runId: string): Promise<IWorkflowRun | null>;
}
