import { IWorkflowJob } from '../ICICD';

export interface IJobRunnerService {
  executeJob(
    job: IWorkflowJob,
    runId: string,
    repoCloneUrl: string,
    commitHash: string,
  ): Promise<boolean>;
}
