import { LoginDTO } from 'src/application/dtos/auth/LoginDTO';

export interface ILoginUseCase {
  execute(dto: LoginDTO): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      userId: string;
      email: string;
      role: string;
      avatar?: string;
    };
  }>;
}
