export interface IResetPasswordUseCase {
  execute(email: string, otp: string, newPassword: string): Promise<{ message: string }>;
}
