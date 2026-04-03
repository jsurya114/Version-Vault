export interface ICheckCollaboratorUseCase {
  execute(repositoryId: string, userId: string): Promise<boolean>;
}
