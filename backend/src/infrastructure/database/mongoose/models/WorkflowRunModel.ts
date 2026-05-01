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
    steps: {
      type: [
        {
          name: { type: String, required: true },
          status: {
            type: String,
            enum: ['pending', 'running', 'success', 'failed', 'skipped'],
            default: 'pending',
          },
          logs: { type: String, default: '' },
          startedAt: { type: Date },
          completedAt: { type: Date },
          duration: { type: Number },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

export const WorkflowRunModel = mongoose.model<IWorkflowRunDocument>(
  'WorkflowRun',
  WorkflowRunSchema,
);
