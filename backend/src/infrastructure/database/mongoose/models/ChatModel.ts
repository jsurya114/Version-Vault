import mongoose, { Schema, Document } from 'mongoose';

export interface IChatDocument extends Document {
  repositoryId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderUsername: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const chatSchema = new Schema(
  {
    repositoryId: { type: Schema.Types.ObjectId, ref: 'Repository', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderUsername: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true },
);

export const ChatModel = mongoose.model<IChatDocument>('Chat', chatSchema);
