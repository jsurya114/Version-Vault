export interface IWorkflowStep {
  name: string;
  run?: string;
  uses?: string;
}
export interface IWorkflowJob {
  name: string;
  runsOn: string;
  steps: IWorkflowStep[];
}
export interface IWorkflow {
  name: string;
  on: string[];
  jobs: Record<string, IWorkflowJob>;
}
export interface IWorkflowRun {
  id?: string;
  repositoryId: string;
  commitHash: string;
  status: 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  logs: string;
  createdAt: Date;
}
