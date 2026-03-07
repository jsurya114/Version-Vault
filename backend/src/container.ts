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

//validator
import { RegisterValidator } from './application/use-cases/validators/RegisterValidator';
import { VerifyOtpValidator } from './application/use-cases/validators/VerifyOtpValidator';
//usecases
import { RegisterUseCase } from './application/use-cases/auth/RegisterUseCase';
import { VerifyOtpUseCase } from './application/use-cases/auth/VerifyOtpUseCase';

//services
container.register(TOKENS.IHashService, { useClass: HashService });
container.register(TOKENS.ITokenService, { useClass: TokenService });
container.register(TOKENS.IOtpService, { useClass: OtpService });
container.register(TOKENS.IEmailService, { useClass: NodemailerService });

//repositories
container.register(TOKENS.IUserRepository, { useClass: MongoUserRepository });

//validator
container.register(RegisterValidator, { useClass: RegisterValidator });
container.register(VerifyOtpValidator, { useClass: VerifyOtpValidator });

//useCase

container.register(TOKENS.IRegisterUseCase, { useClass: RegisterUseCase });

container.register(TOKENS.IVerifyUseCase, { useClass: VerifyOtpUseCase });

export { container };
