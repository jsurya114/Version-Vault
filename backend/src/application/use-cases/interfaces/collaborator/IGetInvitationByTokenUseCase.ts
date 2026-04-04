import { IInvitation } from '../../../../domain/interfaces/IInvitation';

export interface IGetInvitationByTokenUseCase {
  execute(token: string): Promise<IInvitation>;
}
