export interface IAddCollaboratorUseCase {
  execute(
    ownerId: string,
    ownerUsername: string,
    repositoryId: string,
    repositoryName: string,
    collaboratorUsername: string,
    role: string,
  ): Promise<void>;
}
