"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationMapper = void 0;
class InvitationMapper {
    static toEntity(doc) {
        const d = doc;
        return {
            id: d.id?.toString() || d._id?.toString() || '',
            token: d.token,
            repositoryId: d.repositoryId,
            repositoryName: d.repositoryName,
            ownerId: d.ownerId,
            ownerUsername: d.ownerUsername,
            inviteeEmail: d.inviteeEmail,
            inviteeUserId: d.inviteeUserId,
            inviteeUsername: d.inviteeUsername,
            role: d.role,
            status: d.status,
            expiresAt: d.expiresAt,
            createdAt: d.createdAt,
        };
    }
}
exports.InvitationMapper = InvitationMapper;
