import mongoose, { Document, Schema } from 'mongoose';

export interface ICommentDocument extends Document {
  targetId: mongoose.Types.ObjectId;
  targetType: string;
  repositoryId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  authorUsername: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema(
  {
    targetId: { type: Schema.Types.ObjectId, required: true },
    targetType: { type: String, enum: ['issue', 'pr'], required: true },
    repositoryId: { type: Schema.Types.ObjectId, ref: 'Repository', required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorUsername: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true },
);

commentSchema.index({ targetId: 1, targetType: 1 });
export const CommentModel = mongoose.model<ICommentDocument>('Comment', commentSchema);
