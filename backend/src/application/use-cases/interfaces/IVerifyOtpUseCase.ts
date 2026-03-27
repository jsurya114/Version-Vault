import { VerifyOtpDTO } from '../../../application/dtos/auth/VerifyOtpDTO';

export interface IVerifyOtpUseCase {
  execute(dto: VerifyOtpDTO): Promise<{ message: string }>;
}
