import mongoose, { Schema, Document } from 'mongoose';

export interface IInvitationDocument extends Document {
  token: string;
  repositoryId: string;
  repositoryName: string;
  ownerId: string;
  ownerUsername: string;
  inviteeEmail: string;
  inviteeUserId?: string;
  inviteeUsername?: string;
  role: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: Date;
  createdAt: Date;
}

const InvitationSchema = new Schema<IInvitationDocument>(
  {
    token: { type: String, required: true, unique: true },
    repositoryId: { type: String, required: true },
    repositoryName: { type: String, required: true },
    ownerId: { type: String, required: true },
    ownerUsername: { type: String, required: true },
    inviteeEmail: { type: String, required: true },
    inviteeUserId: { type: String },
    inviteeUsername: { type: String },
    role: { type: String, enum: ['read', 'write', 'admin'], default: 'read' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'expired'],
      default: 'pending',
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

InvitationSchema.index({ repositoryId: 1, inviteeEmail: 1 });

export const InvitationModel = mongoose.model<IInvitationDocument>('Invitation', InvitationSchema);
