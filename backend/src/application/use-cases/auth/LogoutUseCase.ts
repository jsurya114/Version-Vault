import { inject, injectable } from 'tsyringe';
import { IlogoutUseCase } from '../interfaces/ILogoutUseCase';
import { ITokenService } from '../../../domain/interfaces/services/ITokenService';
import { TOKENS } from '../../../shared/constants/tokens';

@injectable()
export class LogoutUseCase implements IlogoutUseCase {
  constructor(@inject(TOKENS.ITokenService) private tokenService: ITokenService) {}
  async execute(): Promise<{ message: string }> {
    //clear cookies on frontend is sufficient
    return { message: 'Logout out successfully' };
  }
}
