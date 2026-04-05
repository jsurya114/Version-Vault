import { IRepository } from '../../../../domain/interfaces/IRepository';
export interface CollabRepoWithRole {
  repo: IRepository;
  role: string;
}

export interface IGetAllCollabsUseCase {
  execute(userId: string): Promise<CollabRepoWithRole[]>;
}
