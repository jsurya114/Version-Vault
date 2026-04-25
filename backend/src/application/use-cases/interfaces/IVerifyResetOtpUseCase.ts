export interface IVerifyResetOtpUseCase {
  execute(email: string, otp: string): Promise<{ message: string }>;
}
