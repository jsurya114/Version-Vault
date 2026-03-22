import mongoose, { Schema, Document } from 'mongoose';
import { PRStatus } from 'src/domain/interfaces/IPullRequest';

export interface IPullRequestDocument extends Document {
  title: string;
  description?: string;
  status: PRStatus;
  sourceBranch: string;
  targetBranch: string;
  repositoryId: string;
  authorId: string;
  authorUsername: string;
  reviewers: string[];
  commentsCount: number;
  createdAt: Date;
  updateAt: Date;
}

const PullRequestSchema = new Schema<IPullRequestDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['open', 'closed', 'merged'], default: 'open' },
    sourceBranch: { type: String, required: true },
    targetBranch: { type: String, required: true },
    repositoryId: { type: String, required: true },
    authorId: { type: String, required: true },
    authorUsername: { type: String, required: true },
    reviewers: { type: [String], default: [] },
    commentsCount: { type: Number, default: 0 },
  },

  { timestamps: true },
);
PullRequestSchema.index({ repositoryId: 1, status: 1 });

export const PullRequestModel = mongoose.model<IPullRequestDocument>(
  'PullRequest',
  PullRequestSchema,
);
