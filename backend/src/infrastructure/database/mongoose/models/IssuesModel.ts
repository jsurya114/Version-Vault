import mongoose, { Schema, Document } from 'mongoose';
import { IssueStatus, IssuePriority } from 'src/domain/interfaces/IIssues';

export interface IIssuesDocument extends Document {
  title: string;
  description?: string;
  status: IssueStatus;
  priority: IssuePriority;
  repositoryId: string;
  authorId: string;
  authorUsername: string;
  assignees: string[];
  labels: string[];
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const IssueSchema = new Schema<IIssuesDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    repositoryId: { type: String, required: true },
    authorId: { type: String, required: true },
    authorUsername: { type: String, required: true },
    assignees: { type: [String], default: [] },
    labels: { type: [String], default: [] },
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

IssueSchema.index({ repositoryId: 1, status: 1 });
export const IssueModel = mongoose.model<IIssuesDocument>('Issue', IssueSchema);
