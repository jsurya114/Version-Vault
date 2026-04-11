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
  IVisibilityUseCase: Symbol.for('IVisibilityUseCase'),

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

  // Follow
  IFollowRepository: Symbol.for('IFollowRepository'),
  IFollowUseCase: Symbol.for('IFollowUseCase'),
  IUnfollowUseCase: Symbol.for('IUnfollowUseCase'),
  IGetFollowersUseCase: Symbol.for('IGetFollowersUseCase'),
  IGetFollowingUseCase: Symbol.for('IGetFollowingUseCase'),

  //branch
  ICreateBranchUseCase: Symbol.for('ICreateBranchUseCase'),
  IDeleteBranchUseCase: Symbol.for('IDeleteBranchUseCase'),
  //commits
  ICreateCommitUseCase: Symbol.for('ICreateCommitUseCase'),
  ICompareCommitUseCase: Symbol.for('ICompareCommitUseCase'),

  //userProfile
  IGetProfileUseCase: Symbol.for('IGetProfileUseCase'),
  IUpdateProfileUseCase: Symbol.for('IUpdateProfileUseCase'),

  //repo management
  IAdminRepoRepository: Symbol.for('IAdminRepoRepository'),
  IGetAllRepoUseCase: Symbol.for('IGetAllRepoUseCase'),
  IGetRepoByIdUseCase: Symbol.for('IGetRepoByIdUseCase'),
  IBlockRepoUseCase: Symbol.for('IBlockRepoUseCase'),
  IUnblockRepoUseCase: Symbol.for('IUnblockRepoUseCase'),
  ILogger: Symbol.for('ILogger'),
  IForkRepoUseCase: Symbol.for('IForkRepoUseCase'),
  IToggleStarUseCase: Symbol.for('IToggleStarUseCase'),
  IGetStarsUseCase: Symbol.for('IGetStarsUseCase'),
  IUploadFileUseCase: Symbol.for('IUploadFileUseCase'),
  IGetActiveBranchUseCase: Symbol.for('IGetActiveBranchUseCase'),

  // Collaborator
  ICollaboratorRepository: Symbol.for('ICollaboratorRepository'),
  IAddCollaboratorUseCase: Symbol.for('IAddCollaboratorUseCase'),
  IRemoveCollaboratorUseCase: Symbol.for('IRemoveCollaboratorUseCase'),
  IGetCollaboratorUseCase: Symbol.for('IGetCollaboratorUseCase'),
  IUpdateCollaboratorUseCase: Symbol.for('IUpdateCollaboratorUseCase'),
  ICheckCollaboratorUseCase: Symbol.for('ICheckCollaboratorUseCase'),

  // Invitation
  IInvitationRepository: Symbol.for('IInvitationRepository'),
  ISendInvitationUseCase: Symbol.for('ISendInvitationUseCase'),
  IAcceptInvitationUseCase: Symbol.for('IAcceptInvitationUseCase'),
  IDeclineInvitationUseCase: Symbol.for('IDeclineInvitationUseCase'),
  IGetInvitationByTokenUseCase: Symbol.for('IGetInvitationByTokenUseCase'),
  IGetPendingInvitationsUseCase: Symbol.for('IGetPendingInvitationsUseCase'),
  IGetAllCollabsUseCase: Symbol.for('IGetAllCollabsUseCase'),

  //comments
  ICommentRepository: Symbol.for('ICommentRepository'),
  ICreateCommentUseCase: Symbol.for('ICreateCommentUsecase'),
  IListCommentUseCase: Symbol.for('IListCommentUseCase'),
  IDeleteCommentUseCase: Symbol.for('IDeleteCommentUseCase'),

  //chat usecase
  IChatRepository: Symbol.for('IChatRepository'),
  ISendMessageUseCase: Symbol.for('ISendMessageUseCase'),
  IGetChatHistoryUseCase: Symbol.for('IGetChatHistoryUseCase'),
  IGetMessageUsecase: Symbol.for('IGetMessageUsecase'),
  IDeleteMessageUseCase: Symbol.for('IDeleteMessageUseCase'),
  IListChatRepoUseCase: Symbol.for('IListChatRepoUseCase'),
  HttpServer: Symbol.for('HttpServer'),
} as const;
