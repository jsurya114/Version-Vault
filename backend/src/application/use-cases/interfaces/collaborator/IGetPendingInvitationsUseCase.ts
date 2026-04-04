import { IInvitation } from '../../../../domain/interfaces/IInvitation';

export interface IGetPendingInvitationsUseCase {
  execute(email: string): Promise<IInvitation[]>;
}
