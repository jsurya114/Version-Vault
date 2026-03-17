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
  },
  { timestamps: true },
);

RepositorySchema.index({ ownerId: 1, name: 1 }, { unique: true });
export const RepositoryModel = mongoose.model<IRepositoryDocument>('Repository', RepositorySchema);
