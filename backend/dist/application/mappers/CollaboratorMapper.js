"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollaboratorMapper = void 0;
class CollaboratorMapper {
    static toICollaborator(doc) {
        const d = doc;
        return {
            id: d.id?.toString() || d._id?.toString() || '',
            repositoryId: d.repositoryId,
            repositoryName: d.repositoryName,
            ownerId: d.ownerId,
            ownerUsername: d.ownerUsername,
            collaboratorId: d.collaboratorId,
            collaboratorUsername: d.collaboratorUsername,
            role: d.role,
            createdAt: d.createdAt,
        };
    }
    static toDTO(collab) {
        return {
            id: collab.id,
            repositoryId: collab.repositoryId,
            repositoryName: collab.repositoryName,
            ownerId: collab.ownerId,
            ownerUsername: collab.ownerUsername,
            collaboratorId: collab.collaboratorId,
            collaboratorUsername: collab.collaboratorUsername,
            role: collab.role,
            createdAt: collab.createdAt,
        };
    }
}
exports.CollaboratorMapper = CollaboratorMapper;
