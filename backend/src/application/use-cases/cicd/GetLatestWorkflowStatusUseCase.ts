import { injectable } from 'tsyringe';
import { IGetLatestWorkflowStatusUseCase } from '../interfaces/cicd/IGetLatestWorkflowStatusUseCase';
import { WorkflowRunModel } from '../../../infrastructure/database/mongoose/models/WorkflowRunModel';

@injectable()
export class GetLatestWorkflowStatusUseCase implements IGetLatestWorkflowStatusUseCase {
  async execute(
    repositoryId: string,
  ): Promise<{ status: string; commitHash: string; createdAt: Date } | null> {
    const latestRun = await WorkflowRunModel.findOne({ repositoryId })
      .sort({ createdAt: -1 })
      .select('status commitHash createdAt')
      .lean();

    if (!latestRun) {
      return null;
    }

    return {
      status: latestRun.status,
      commitHash: latestRun.commitHash,
      createdAt: latestRun.createdAt,
    };
  }
}
