import { ICollaborator } from '../../domain/interfaces/ICollaborator';
import { CollaboratorResponseDTO } from '../dtos/repository/CollaboratorDTO';

export class CollaboratorMapper {
  static toICollaborator(doc: unknown): ICollaborator {
    const d = doc as ICollaborator & { _id?: { toString(): string } };
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
