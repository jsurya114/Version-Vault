export const TOKENS = {
  // Repositories
  IUserRepository: Symbol.for('IUserRepository'),
  IAdminRepository: Symbol.for('IAdminRepository'),

  // Services
  IHashService: Symbol.for('IHashService'),
  ITokenService: Symbol.for('ITokenService'),
  IOtpService: Symbol.for('IOtpService'),
  IEmailService: Symbol.for('IEmailService'),
  IGoogleAuthService: Symbol.for('IGoogleAuthService'),

  //usecases
  IRegisterUseCase: Symbol.for('IRegisterUseCase'),
  ILoginUseCase: Symbol.for('ILoginUseCase'),
  IVerifyUseCase: Symbol.for('IVerifyUseCase'),
  IGoogleAuthUseCase: Symbol.for('IGoogleAuthUseCase'),
  ILogoutUseCase: Symbol.for('ILogoutUseCase'),
  IRefreshTokenUseCase: Symbol.for('IRefreshTokenUseCase'),
  IGetMeUseCase: Symbol.for('IGetMeUseCase'),

  //admin
  IGetAllUsersUseCase: Symbol.for('IGetAllUsersUseCase'),
} as const;
