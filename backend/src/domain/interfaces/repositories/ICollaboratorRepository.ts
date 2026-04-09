import { ICollaborator } from '../ICollaborator';
import { IBaseRepository } from './IBaseRepository';

export interface ICollaboratorRepository extends IBaseRepository<ICollaborator> {
  findByRepoAndUser(repositoryId: string, collaboratorId: string): Promise<ICollaborator | null>;
  findByRepository(repositoryId: string): Promise<ICollaborator[]>;
  findByUser(collaboratorId: string): Promise<ICollaborator[]>;
  deleteByRepoAndUser(repositoryId: string, collaboratorId: string): Promise<boolean>;
  updateRole(
    repositoryId: string,
    collaboratorId: string,
    role: string,
  ): Promise<ICollaborator | null>;
  findCollabedRepos(userId:string):Promise<ICollaborator[]>
}
