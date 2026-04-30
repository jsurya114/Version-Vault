import { injectable } from 'tsyringe';
import { IListWorkflowRunsUseCase } from '../interfaces/cicd/IListWorkflowRunsUseCase';
import { IWorkflowRun } from '../../../domain/interfaces/ICICD';
import { WorkflowRunModel } from '../../../infrastructure/database/mongoose/models/WorkflowRunModel';

@injectable()
export class ListWorkflowRunsUseCase implements IListWorkflowRunsUseCase {
  async execute(repositoryId: string): Promise<IWorkflowRun[]> {
    const runs = await WorkflowRunModel.find({ repositoryId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return runs;
  }
}
