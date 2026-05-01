import axiosInstance from './axiosInstance';
import { WORKFLOW_ENDPOINTS } from 'src/constants/api';

export interface StepResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  logs: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
}

export interface WorkflowRun {
  _id: string;
  repositoryId: string;
  commitHash: string;
  status: 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  logs: string;
  steps: StepResult[];
  createdAt: string;
  updatedAt: string;
}

export const workflowService = {
  listRuns: async (username: string, reponame: string): Promise<WorkflowRun[]> => {
    const res = await axiosInstance.get(`${WORKFLOW_ENDPOINTS.BASE}/${username}/${reponame}`);
    return res.data.data;
  },

  getRun: async (runId: string): Promise<WorkflowRun> => {
    const res = await axiosInstance.get(`${WORKFLOW_ENDPOINTS.BASE}/run/${runId}`);
    return res.data.data;
  },

  getLatestStatus: async (
    username: string,
    reponame: string,
  ): Promise<{ status: string; commitHash: string; createdAt: string } | null> => {
    const res = await axiosInstance.get(
      `${WORKFLOW_ENDPOINTS.BASE}/${username}/${reponame}/status`,
    );
    return res.data.data;
  },
};
