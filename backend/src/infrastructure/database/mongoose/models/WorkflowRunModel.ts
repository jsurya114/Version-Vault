import mongoose, { Schema, Document } from 'mongoose';
import { IWorkflowRun } from '../../../../domain/interfaces/ICICD';

export interface IWorkflowRunDocument extends IWorkflowRun, Document {
  id: string;
}

const WorkflowRunSchema = new Schema<IWorkflowRunDocument>(
  {
    repositoryId: { type: String, required: true },
    commitHash: { type: String, required: true },
    status: { type: String, enum: ['QUEUED', 'RUNNING', 'SUCCESS', 'FAILED'], default: 'QUEUED' },
    logs: { type: String, default: '' },
  },
  { timestamps: true },
);

export const WorkflowRunModel = mongoose.model<IWorkflowRunDocument>(
  'WorkflowRun',
  WorkflowRunSchema,
);
