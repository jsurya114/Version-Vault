export interface ICollaborator {
  id?: string;
  repositoryId: string;
  repositoryName: string;
  ownerId: string;
  ownerUsername: string;
  collaboratorId: string;
  collaboratorUsername: string;
  role: string;
  createdAt?: Date;
}
