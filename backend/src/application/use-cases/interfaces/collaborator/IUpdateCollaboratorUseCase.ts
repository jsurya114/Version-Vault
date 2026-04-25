import { ICollaborator } from '../../../../domain/interfaces/ICollaborator';
export interface IUpdateCollaboratorUseCase {
  execute(
    ownerId: string,
    repositoryId: string,
    collaboratorId: string,
    role: string,
  ): Promise<ICollaborator>;
}
