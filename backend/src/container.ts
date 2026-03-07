import 'reflect-metadata';
import { container } from 'tsyringe';

//tokens
import { TOKENS } from './shared/constants/tokens';

//repositories
import { MongoUserRepository } from './infrastructure/database/mongoose/repositories/MongoUserRepository';

//services
import { HashService } from './infrastructure/services/HashService';
import { TokenService } from './infrastructure/services/TokenService';
import { OtpService } from './infrastructure/services/OtpService';
import { NodemailerService } from './infrastructure/external/email/NodemailerService';
import { GoogleAuthService } from './infrastructure/services/GoogleAuthService';

//validator
import { RegisterValidator } from './application/use-cases/validators/RegisterValidator';
import { VerifyOtpValidator } from './application/use-cases/validators/VerifyOtpValidator';
import { LoginValidator } from './application/use-cases/validators/LoginValidator';
//usecases
import { RegisterUseCase } from './application/use-cases/auth/RegisterUseCase';
import { VerifyOtpUseCase } from './application/use-cases/auth/VerifyOtpUseCase';
import { LoginUseCase } from './application/use-cases/auth/LoginUseCase';
import { GoogleAuthUseCase } from './application/use-cases/auth/GoogleAuthUseCase';
//services
container.register(TOKENS.IHashService, { useClass: HashService });
container.register(TOKENS.ITokenService, { useClass: TokenService });
container.register(TOKENS.IOtpService, { useClass: OtpService });
container.register(TOKENS.IEmailService, { useClass: NodemailerService });
container.register(TOKENS.IGoogleAuthService, { useClass: GoogleAuthService });

//repositories
container.register(TOKENS.IUserRepository, { useClass: MongoUserRepository });

//validator
container.register(RegisterValidator, { useClass: RegisterValidator });
container.register(VerifyOtpValidator, { useClass: VerifyOtpValidator });
container.register(LoginValidator, { useClass: LoginValidator });

//useCase

container.register(TOKENS.IRegisterUseCase, { useClass: RegisterUseCase });

container.register(TOKENS.IVerifyUseCase, { useClass: VerifyOtpUseCase });
container.register(TOKENS.ILoginUseCase, { useClass: LoginUseCase });
container.register(TOKENS.IGoogleAuthUseCase, { useClass: GoogleAuthUseCase });

export { container };
