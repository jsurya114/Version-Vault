export interface IGoogleAuthUseCase {
  execute(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      username: string;
      avatar: string;
      role: string;
    };
  }>;
}
