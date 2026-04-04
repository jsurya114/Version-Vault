import { IInvitation } from '../IInvitation';
import { IBaseRepository } from './IBaseRepository';

export interface IInvitationRepository extends IBaseRepository<IInvitation> {
  findByToken(token: string): Promise<IInvitation | null>;
  findPendingByRepoAndEmail(repositoryId: string, email: string): Promise<IInvitation | null>;
  findPendingByEmail(email: string): Promise<IInvitation[]>;
  findByRepository(repositoryId: string): Promise<IInvitation[]>;
  updateStatus(token: string, status: string): Promise<IInvitation | null>;
}
