"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationMapper = void 0;
class NotificationMapper {
    static toEntity(doc) {
        const d = doc;
        return {
            id: d.id?.toString() || d._id?.toString() || '',
            recipientId: d.recipientId,
            actorId: d.actorId,
            actorUsername: d.actorUsername,
            type: d.type,
            message: d.message,
            repositoryId: d.repositoryId,
            metadata: d.metadata,
            isRead: d.isRead,
            createdAt: d.createdAt,
        };
    }
}
exports.NotificationMapper = NotificationMapper;
