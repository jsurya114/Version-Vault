import { IComment } from '../../domain/interfaces/IComment';
import { CommentResponseDTO } from '../dtos/repository/CommentDTO';

export class CommentMapper {
  static toEntity(doc: unknown): IComment {
    const d = doc as {
      id?: { toString(): string };
      _id?: { toString(): string };
      targetId?: { toString(): string };
      targetType?: string;
      repositoryId?: { toString(): string };
      authorId?: { toString(): string };
      authorUsername?: string;
      content?: string;
      createdAt?: Date | string;
      updatedAt?: Date | string;
    };

    return {
      id: d.id?.toString() || d._id?.toString() || '',
      targetId: d.targetId?.toString() || '',
      targetType: d.targetType as 'issue' | 'pr',
      repositoryId: d.repositoryId?.toString() || '',
      authorId: d.authorId?.toString() || '',
      authorUsername: d.authorUsername || '',
      content: d.content || '',
      // Convert to string to satisfy your `createdAt: string` rule
      createdAt: d.createdAt ? new Date(d.createdAt) : new Date(),

      // Convert to Date object to satisfy your `updatedAt: Date` rule
      updatedAt: d.updatedAt ? new Date(d.updatedAt) : new Date(),
    };
  }

  static toResponseDTO(comment: IComment): CommentResponseDTO {
    return {
      id: comment.id!,
      targetId: comment.targetId,
      targetType: comment.targetType,
      authorId: comment.authorId,
      authorUsername: comment.authorUsername,
      content: comment.content,
      createdAt: comment.createdAt, // This is already a string now, so no conversion needed here!
    };
  }
}
