import mongoose, { Schema, Document } from 'mongoose';
import { PRStatus,MergeApproval } from '../../../../domain/interfaces/IPullRequest';

export interface IPullRequestDocument extends Document {
  title: string;
  description?: string;
  status: PRStatus;
  mergeApproval:MergeApproval;
  sourceBranch: string;
  targetBranch: string;
  repositoryId: string;
  authorId: string;
  authorUsername: string;
  reviewers: string[];
  commentsCount: number;
  baseCommitHash:string
  headCommitHash:string
  createdAt: Date;
  updateAt: Date;
}

const PullRequestSchema = new Schema<IPullRequestDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['open', 'closed', 'merged'], default: 'open' },
    mergeApproval:{type:String,enum:['none','pending','approved','rejected'],default:'none'},
    sourceBranch: { type: String, required: true },
    targetBranch: { type: String, required: true },
    repositoryId: { type: String, required: true },
    authorId: { type: String, required: true },
    authorUsername: { type: String, required: true },
    reviewers: { type: [String], default: [] },
    commentsCount: { type: Number, default: 0 },
        baseCommitHash: { type: String, required: false },
    headCommitHash: { type: String, required: false },

  },

  { timestamps: true },
);
PullRequestSchema.index({ repositoryId: 1, status: 1 });

export const PullRequestModel = mongoose.model<IPullRequestDocument>(
  'PullRequest',
  PullRequestSchema,
);
