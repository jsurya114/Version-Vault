export const TOKENS = {
  // Repositories
  IUserRepository: Symbol.for('IUserRepository'),
  IAdminRepository: Symbol.for('IAdminRepository'),
  IRepoRepository: Symbol.for('IRepoRepository'),
  IPullRequestRepository: Symbol.for('IPullRequestRepository'),
  IIssuesRepository: Symbol.for('IIssuesRepository'),

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
  IForgotPasswordUseCase: Symbol.for('IForgotPasswordUseCase'),
  IResetPasswordUseCase: Symbol.for('IResetPasswordUseCase'),
  IResendOtpUseCase: Symbol.for('IResendOtpUseCase'),

  //admin
  IGetAllUsersUseCase: Symbol.for('IGetAllUsersUseCase'),
  IGetUserByIdUseCase: Symbol.for('IGetUserByIdUseCase'),
  IBlockUserUseCase: Symbol.for('IBlockUserUseCase'),
  IUnblockUserUseCase: Symbol.for('IUnblockUserUseCase'),

  //repository
  ICreateRepoUseCase: Symbol.for('ICreateRepoUseCase'),
  IGetRepoUseCase: Symbol.for('IGetRepoUseCase'),
  IListRepoUseCase: Symbol.for('IListRepoUseCase'),
  IDeleteRepoUseCase: Symbol.for('IDeleteRepoUseCase'),

  // Git File Browser Use Cases
  IGetFilesUseCase: Symbol.for('IGetFilesUseCase'),
  IGetFileContentUseCase: Symbol.for('IGetFileContentUseCase'),
  IGetCommitsUseCase: Symbol.for('IGetCommitsUseCase'),
  IGetBranchesUseCase: Symbol.for('IGetBranchesUseCase'),

  // PR Use Cases
  ICreatePRUseCase: Symbol.for('ICreatePRUseCase'),
  IGetPRUseCase: Symbol.for('IGetPRUseCase'),
  IListPRsUseCase: Symbol.for('IListPRsUseCase'),
  IMergePRUseCase: Symbol.for('IMergePRUseCase'),
  IClosePRUseCase: Symbol.for('IClosePRUseCase'),

  // Issue Use Cases
  ICreateIssueUseCase: Symbol.for('ICreateIssueUseCase'),
  IGetIssueUseCase: Symbol.for('IGetIssueUseCase'),
  IListIssuesUseCase: Symbol.for('IListIssuesUseCase'),
  ICloseIssueUseCase: Symbol.for('ICloseIssueUseCase'),
} as const;
