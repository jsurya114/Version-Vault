import { VerifyOtpDTO } from 'src/application/dtos/auth/VerifyOtpDTO';

export interface IVerifyOtpUseCase {
  execute(dto: VerifyOtpDTO): Promise<{ message: string }>;
}
