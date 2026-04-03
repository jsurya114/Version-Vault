import mongoose, { Schema, Document } from 'mongoose';

export interface ICollaboratorDocument extends Document {
  repositoryId: string;
  repositoryName: string;
  ownerId: string;
  ownerUsername: string;
  collaboratorId: string;
  collaboratorUsername: string;
  role: string;
  createdAt: Date;
}

const CollaboratorSchema = new Schema<ICollaboratorDocument>(
  {
    repositoryId: { type: String, required: true },
    repositoryName: { type: String, required: true },
    ownerId: { type: String, required: true },
    ownerUsername: { type: String, required: true },
    collaboratorId: { type: String, required: true },
    collaboratorUsername: { type: String, required: true },
    role: { type: String, enum: ['read', 'write', 'admin'], default: 'read' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

CollaboratorSchema.index({ repositoryId: 1, collaboratorId: 1 }, { unique: true });

export const CollaboratorModel = mongoose.model<ICollaboratorDocument>(
  'Collaborator',
  CollaboratorSchema,
);
