export interface IResendOtpUseCase {
  execute(email: string): Promise<{ message: string }>;
}
