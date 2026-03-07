export interface IGoogleAuthService {
  getAuthUrl(): string;
  getTokenFromCode(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    idToken: string;
  }>;
  getUserInfo(idToken: string): Promise<{
    googleId: string;
    email: string;
    name: string;
    avatar: string;
  }>;
}
