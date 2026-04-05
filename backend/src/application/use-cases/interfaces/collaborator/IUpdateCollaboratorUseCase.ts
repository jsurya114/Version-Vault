import { ICollaborator } from 'src/domain/interfaces/ICollaborator';
export interface IUpdateCollaboratorUseCase {
  execute(
    ownerId: string,
    repositoryId: string,
    collaboratorId: string,
    role: string,
  ): Promise<ICollaborator>;
}
