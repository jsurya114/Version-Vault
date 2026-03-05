import { LoginDTO } from 'src/application/dtos/auth/LoginDTO';

export interface ILoginUseCase {
  execute(dto: LoginDTO): Promise<{ message: string }>;
}
