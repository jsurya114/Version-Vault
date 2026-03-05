export const TOKENS = {
  // Repositories
  IUserRepository: Symbol.for('IUserRepository'),

  // Services
  IHashService: Symbol.for('IHashService'),
  ITokenService: Symbol.for('ITokenService'),
  IOtpService: Symbol.for('IOtpService'),
  IEmailService: Symbol.for('IEmailService'),

  //usecases
  IRegisterUseCase: Symbol.for('IRegisterUseCase'),
  ILoginUseCase: Symbol.for('ILoginUseCase'),
} as const;
