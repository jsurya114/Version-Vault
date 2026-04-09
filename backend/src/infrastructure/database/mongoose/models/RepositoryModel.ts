import mongoose, { Schema, Document } from 'mongoose';
import { RepositoryVisibility } from '../../../../domain/enums/index';

export interface IRepositoryDocument extends Document {
  name: string;
  description?: string;
  visibility: RepositoryVisibility;
  ownerId: string;
  ownerUsername: string;
  defaultBranch: string;
  stars: number;
  forks: number;
  size: number;
  isDeleted: boolean;
  isBlocked: boolean;
  isFork: boolean;
  parentRepoId?: boolean;
  parentRepoOwnerUsername?: string;
  starredBy?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RepositorySchema = new Schema<IRepositoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    visibility: {
      type: String,
      enum: Object.values(RepositoryVisibility),
      default: RepositoryVisibility.PUBLIC,
    },
    ownerId: { type: String, required: true },
    ownerUsername: { type: String, required: true },
    defaultBranch: { type: String, default: 'main' },
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    size: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isFork: { type: Boolean, default: false },
    parentRepoId: { type: String, default: null },
    parentRepoOwnerUsername: { type: String, default: null },
    starredBy: { type: [String], default: [] },
  },
  { timestamps: true },
);

RepositorySchema.index({ ownerId: 1, name: 1 }, { unique: true });
export const RepositoryModel = mongoose.model<IRepositoryDocument>('Repository', RepositorySchema);
