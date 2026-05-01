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
export interface IStepResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  logs: string;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number; // in ms
}
export interface IWorkflowRun {
  id?: string;
  repositoryId: string;
  commitHash: string;
  status: 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  logs: string;
  steps: IStepResult[];
  createdAt: Date;
}
