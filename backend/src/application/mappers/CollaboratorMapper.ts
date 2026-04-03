import { ICollaborator } from '../../domain/interfaces/ICollaborator';
import { CollaboratorResponseDTO } from '../dtos/repository/CollaboratorDTO';

export class CollaboratorMapper {
  static toICollaborator(doc: any): ICollaborator {
    return {
      id: doc.id?.toString() || doc._id?.toString(),
      repositoryId: doc.repositoryId,
      repositoryName: doc.repositoryName,
      ownerId: doc.ownerId,
      ownerUsername: doc.ownerUsername,
      collaboratorId: doc.collaboratorId,
      collaboratorUsername: doc.collaboratorUsername,
      role: doc.role,
      createdAt: doc.createdAt,
    };
  }

  static toDTO(collab: ICollaborator): CollaboratorResponseDTO {
    return {
      id: collab.id as string,
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
