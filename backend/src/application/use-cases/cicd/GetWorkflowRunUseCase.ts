import { injectable } from 'tsyringe';
import { IGetWorkflowRunUseCase } from '../interfaces/cicd/IGetWorkflowRunUseCase';
import { IWorkflowRun } from '../../../domain/interfaces/ICICD';
import { WorkflowRunModel } from '../../../infrastructure/database/mongoose/models/WorkflowRunModel';
import mongoose from 'mongoose';

@injectable()
export class GetWorkflowRunUseCase implements IGetWorkflowRunUseCase {
  async execute(runId: string): Promise<IWorkflowRun | null> {
    if (!mongoose.Types.ObjectId.isValid(runId)) return null;
    const run = await WorkflowRunModel.findById(runId).lean();
    return run;
  }
}
