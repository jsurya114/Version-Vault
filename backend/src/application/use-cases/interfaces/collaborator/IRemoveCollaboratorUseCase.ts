export interface IRemoveCollaboratorUseCase {
  execute(ownerId: string, repositoryId: string, collaboratorId: string): Promise<void>;
}
