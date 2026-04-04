import { IInvitation } from '../../../../domain/interfaces/IInvitation';

export interface ISendInvitationUseCase {
  execute(
    ownerId: string,
    ownerUsername: string,
    repositoryId: string,
    repositoryName: string,
    inviteeEmail: string,
    role: string,
  ): Promise<IInvitation>;
}
