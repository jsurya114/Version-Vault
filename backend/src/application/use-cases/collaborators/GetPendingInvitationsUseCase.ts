import { injectable, inject } from 'tsyringe';
import { IGetPendingInvitationsUseCase } from '../interfaces/collaborator/IGetPendingInvitationsUseCase';
import { IInvitationRepository } from '../../../domain/interfaces/repositories/IInvitationRepository';
import { IInvitation } from '../../../domain/interfaces/IInvitation';
import { TOKENS } from '../../../shared/constants/tokens';

@injectable()
export class GetPendingInvitationsUseCase implements IGetPendingInvitationsUseCase {
  constructor(@inject(TOKENS.IInvitationRepository) private _inviteRepo: IInvitationRepository) {}

  async execute(email: string): Promise<IInvitation[]> {
    return this._inviteRepo.findPendingByEmail(email);
  }
}
