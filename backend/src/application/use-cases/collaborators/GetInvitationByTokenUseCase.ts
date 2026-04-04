import { injectable, inject } from 'tsyringe';
import { IGetInvitationByTokenUseCase } from '../interfaces/collaborator/IGetInvitationByTokenUseCase';
import { IInvitationRepository } from '../../../domain/interfaces/repositories/IInvitationRepository';
import { IInvitation } from '../../../domain/interfaces/IInvitation';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotFoundError } from '../../../domain/errors/NotFoundError';

@injectable()
export class GetInvitationByTokenUseCase implements IGetInvitationByTokenUseCase {
  constructor(@inject(TOKENS.IInvitationRepository) private _inviteRepo: IInvitationRepository) {}

  async execute(token: string): Promise<IInvitation> {
    const invitation = await this._inviteRepo.findByToken(token);
    if (!invitation) {
      throw new NotFoundError('Invitation Not found');
    }
    return invitation;
  }
}
