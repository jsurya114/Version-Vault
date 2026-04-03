export interface AddCollaboratorDTO {
  collaboratorUsername: string;
  role?: string;
}

export interface UpdateCollaboratorRoleDTO {
  role: string;
}

export interface CollaboratorResponseDTO {
  id: string;
  repositoryId: string;
  repositoryName: string;
  ownerId: string;
  ownerUsername: string;
  collaboratorId: string;
  collaboratorUsername: string;
  role: string;
  createdAt?: Date;
}
