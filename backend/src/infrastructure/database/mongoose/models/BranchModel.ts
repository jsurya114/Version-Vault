import mongoose, { Schema, Document } from 'mongoose';

export interface IBranchDocument extends Document {
  repositoryId: string;
  branchName: string;
  createdBy: string;
  createdAt: Date;
}

const BranchSchema = new Schema<IBranchDocument>(
  {
    repositoryId: { type: String, required: true },
    branchName: { type: String, required: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
);

BranchSchema.index({ repositoryId: 1, branchName: 1 }, { unique: true });

export const BranchModel = mongoose.model<IBranchDocument>('Branch', BranchSchema);
