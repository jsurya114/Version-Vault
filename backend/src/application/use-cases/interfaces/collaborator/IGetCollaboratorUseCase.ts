import { ICollaborator } from '../../../../domain/interfaces/ICollaborator';

export interface IGetCollaboratorUseCase {
  execute(repositoryId: string): Promise<ICollaborator[]>;
}
