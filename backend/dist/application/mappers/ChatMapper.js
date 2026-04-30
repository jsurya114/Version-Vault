"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMapper = void 0;
class ChatMapper {
    static toDTO(dto) {
        return {
            id: dto.id,
            repositoryId: dto.repositoryId,
            senderId: dto.senderId,
            senderUsername: dto.senderUsername,
            content: dto.content,
            createdAt: dto.createdAt,
        };
    }
    static toEntity(doc) {
        const d = doc;
        return {
            id: d.id?.toString() || d._id?.toString() || '',
            repositoryId: d.repositoryId.toString(),
            senderId: d.senderId.toString(),
            senderUsername: d.senderUsername,
            content: d.content,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
        };
    }
}
exports.ChatMapper = ChatMapper;
