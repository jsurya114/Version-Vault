import 'reflect-metadata';
import { container } from 'tsyringe';

//tokens
import { TOKENS } from './shared/constants/tokens';

//repositories
import { MongoUserRepository } from './infrastructure/database/mongoose/repositories/MongoUserRepository';
import { MongoAdminRepository } from './infrastructure/database/mongoose/repositories/MongoAdminRepository';
import { MongoRepoRepository } from './infrastructure/database/mongoose/repositories/MongoRepoRepository';
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
import { LogoutUseCase } from './application/use-cases/auth/LogoutUseCase';
import { RefreshTokenUseCase } from './application/use-cases/auth/RefreshTokenUseCase';
import { GetMeUseCase } from './application/use-cases/auth/GetMeUseCase';
import { ForgotPasswordUseCase } from './application/use-cases/auth/ForgotPasswordUseCase';
import { ResendOtpUseCase } from './application/use-cases/auth/ResendOtpUseCase';
import { ResetPasswordUseCase } from './application/use-cases/auth/ResetPasswordUseCase';

// admin use cases
import { GetAllUsersUseCase } from './application/use-cases/admin/GetAllUsersUseCase';
import { GetUserByIdUseCase } from './application/use-cases/admin/GetUserByIdUseCase';
import { BlockUserUseCase } from './application/use-cases/admin/BlockUserUseCase';
import { UnblockUserUseCase } from './application/use-cases/admin/UnblockUserUseCase';

//repositories
import { CreateRepoUseCase } from './application/use-cases/repository/CreateRepoUseCase';
import { GetRepoUseCase } from './application/use-cases/repository/GetRepoUseCase';
import { ListRepoUseCase } from './application/use-cases/repository/ListRepositoryUseCase';
import { DeleteRepoUseCase } from './application/use-cases/repository/DeleteRepoUseCase';

//services
container.register(TOKENS.IHashService, { useClass: HashService });
container.register(TOKENS.ITokenService, { useClass: TokenService });
container.register(TOKENS.IOtpService, { useClass: OtpService });
container.register(TOKENS.IEmailService, { useClass: NodemailerService });
container.register(TOKENS.IGoogleAuthService, { useClass: GoogleAuthService });

//repositories
container.register(TOKENS.IUserRepository, { useClass: MongoUserRepository });
container.register(TOKENS.IAdminRepository, { useClass: MongoAdminRepository });

//validator
container.register(RegisterValidator, { useClass: RegisterValidator });
container.register(VerifyOtpValidator, { useClass: VerifyOtpValidator });
container.register(LoginValidator, { useClass: LoginValidator });

//useCase

container.register(TOKENS.IRegisterUseCase, { useClass: RegisterUseCase });

container.register(TOKENS.IVerifyUseCase, { useClass: VerifyOtpUseCase });
container.register(TOKENS.ILoginUseCase, { useClass: LoginUseCase });
container.register(TOKENS.IGoogleAuthUseCase, { useClass: GoogleAuthUseCase });
container.register(TOKENS.IRefreshTokenUseCase, { useClass: RefreshTokenUseCase });
container.register(TOKENS.ILogoutUseCase, { useClass: LogoutUseCase });
container.register(TOKENS.IGetMeUseCase, { useClass: GetMeUseCase });
container.register(TOKENS.IGetAllUsersUseCase, { useClass: GetAllUsersUseCase });
container.register(TOKENS.IForgotPasswordUseCase, { useClass: ForgotPasswordUseCase });
container.register(TOKENS.IResetPasswordUseCase, { useClass: ResetPasswordUseCase });
container.register(TOKENS.IResendOtpUseCase, { useClass: ResendOtpUseCase });
container.register(TOKENS.IGetUserByIdUseCase, { useClass: GetUserByIdUseCase });
container.register(TOKENS.IBlockUserUseCase, { useClass: BlockUserUseCase });
container.register(TOKENS.IUnblockUserUseCase, { useClass: UnblockUserUseCase });

//repository
container.register(TOKENS.IGetRepoUseCase, { useClass: GetRepoUseCase });
container.register(TOKENS.ICreateRepoUseCase, { useClass: CreateRepoUseCase });
container.register(TOKENS.IListRepoUseCase, { useClass: ListRepoUseCase });
container.register(TOKENS.IDeleteRepoUseCase, { useClass: DeleteRepoUseCase });

container.register(TOKENS.IRepoRepository, { useClass: MongoRepoRepository });

export { container };
