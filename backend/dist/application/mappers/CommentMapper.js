"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentMapper = void 0;
class CommentMapper {
    static toEntity(doc) {
        const d = doc;
        return {
            id: d.id?.toString() || d._id?.toString() || '',
            targetId: d.targetId?.toString() || '',
            targetType: d.targetType,
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
    static toResponseDTO(comment) {
        return {
            id: comment.id,
            targetId: comment.targetId,
            targetType: comment.targetType,
            authorId: comment.authorId,
            authorUsername: comment.authorUsername,
            content: comment.content,
            createdAt: comment.createdAt, // This is already a string now, so no conversion needed here!
        };
    }
}
exports.CommentMapper = CommentMapper;
