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
import { GitService } from './infrastructure/services/GitService';
import { WinstonLogger } from './infrastructure/services/WinstonLogger';

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

//git file browser use case
import { GetFilesUseCase } from './application/use-cases/repository/GetFilesUseCase';
import { GetFileContentUseCase } from './application/use-cases/repository/GetFileContentUseCase';
import { GetCommitUseCase } from './application/use-cases/repository/GetCommitUseCase';
import { GetBranchesUseCase } from './application/use-cases/branch/GetBranchUseCase';

//pr usecase
import { GetPRUseCase } from './application/use-cases/pullrequest/GetPRUseCase';
import { ListPRUseCase } from './application/use-cases/pullrequest/ListPRUseCase';
import { CreatePRUseCase } from './application/use-cases/pullrequest/CreatePRUseCase';
import { MergePRUseCase } from './application/use-cases/pullrequest/MergePRUseCase';
import { ClosePRUseCase } from './application/use-cases/pullrequest/ClosePRUseCase';

//issues pr usecase
import { GetIssueUseCase } from './application/issues/GetIssuesUseCase';
import { ListIssueUseCase } from './application/issues/ListIssueUseCase';
import { CreateIssueUseCase } from './application/issues/CreateIssueUseCase';
import { CloseIssueUseCase } from './application/issues/CloseIssueUseCase';
import { MongoPullRequestRepository } from './infrastructure/database/mongoose/repositories/MongoPullRequestRepository';
import { MongoIssuesRepository } from './infrastructure/database/mongoose/repositories/MongoIssuesRepository';

//follow usecase
import { MongoFollowRepository } from './infrastructure/database/mongoose/repositories/MongoFollowRepository';
import { FollowUseCase } from './application/use-cases/follow/FollowUseCase';
import { UnfollowUseCase } from './application/use-cases/follow/UnFollowUseCase';
import { GetFollowersUseCase } from './application/use-cases/follow/GetFollowerUseCase';
import { GetFollowingUseCase } from './application/use-cases/follow/GetFollowingUseCase';

//branch
import { CreateBranchUseCase } from './application/use-cases/branch/CreateBranchUseCase';
import { DeleteBranchUseCase } from './application/use-cases/branch/DeleteBranchUseCase';

import { CreateCommitUseCase } from './application/use-cases/commit/CreateCommitUseCase';
import { CompareCommitUseCase } from './application/use-cases/commit/CompareCommitUseCase';

//profile
import { GetProfileUseCase } from './application/use-cases/user/GetProfileUseCase';
import { UpdateProfileUseCase } from './application/use-cases/user/UpdateProfileUseCase';

//repos
import { MongoAdminRepoRepository } from './infrastructure/database/mongoose/repositories/MongoAdminRepoRepository';
import { GetAllRepoUseCase } from './application/use-cases/admin/GetAllRepoUseCase';
import { GetRepoByIdUseCase } from './application/use-cases/admin/GetRepoByIdUseCase';
import { BlockRepoUseCase } from './application/use-cases/admin/BlockRepoUseCase';
import { UnblockRepoUseCase } from './application/use-cases/admin/UnblockRepoUseCase';
import { VisibilityUseCase } from './application/use-cases/repository/VisibilityUseCase';

//collaborators
import { MongoCollaboratorRepository } from './infrastructure/database/mongoose/repositories/MongoCollaboratorRepository';
import { MongoInvitationRepository } from './infrastructure/database/mongoose/repositories/MongoInvitationRepository';
import { AddCollaboratorUseCase } from './application/use-cases/collaborators/AddCollaboratorUseCase';
import { RemoveCollaboratorUseCase } from './application/use-cases/collaborators/RemoveCollaboratorUseCase';
import { UpdateCollaboratorUseCase } from './application/use-cases/collaborators/UpdateCollaboratorUseCase';
import { GetCollaboratorUseCase } from './application/use-cases/collaborators/GetCollaboratorUseCase';
import { CheckCollaboratorUseCase } from './application/use-cases/collaborators/CheckCollaboratorUseCase';
import { SendInvitationUseCase } from './application/use-cases/collaborators/SendInvitationUseCase';
import { AcceptInvitationUseCase } from './application/use-cases/collaborators/AcceptInvitationUseCase';
import { DeclineInvitationUseCase } from './application/use-cases/collaborators/DeclineInvitationUseCase';
import { GetInvitationByTokenUseCase } from './application/use-cases/collaborators/GetInvitationByTokenUseCase';
import { GetPendingInvitationsUseCase } from './application/use-cases/collaborators/GetPendingInvitationsUseCase';
import { GetAllCollabsUseCase } from './application/use-cases/collaborators/GetAllCollabsUseCase';

//comments
import { MongoCommentRepository } from './infrastructure/database/mongoose/repositories/MongoCommentRepository';
import { CreateCommentUseCase } from './application/use-cases/comments/CreateCommentUseCase';
import { ListCommentUseCase } from './application/use-cases/comments/ListCommentUseCase';
import { DeleteCommentUseCase } from './application/use-cases/comments/DeleteCommentUseCase';

//services
container.register(TOKENS.IHashService, { useClass: HashService });
container.register(TOKENS.ITokenService, { useClass: TokenService });
container.register(TOKENS.IOtpService, { useClass: OtpService });
container.register(TOKENS.IEmailService, { useClass: NodemailerService });
container.register(TOKENS.IGoogleAuthService, { useClass: GoogleAuthService });
container.registerSingleton(GitService, GitService);
container.registerSingleton(TOKENS.ILogger, WinstonLogger);

//repositories
container.register(TOKENS.IUserRepository, { useClass: MongoUserRepository });
container.register(TOKENS.IAdminRepository, { useClass: MongoAdminRepository });
container.register(TOKENS.IPullRequestRepository, { useClass: MongoPullRequestRepository });
container.register(TOKENS.IIssuesRepository, { useClass: MongoIssuesRepository });

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
container.register(TOKENS.IVisibilityUseCase, { useClass: VisibilityUseCase });

container.register(TOKENS.IRepoRepository, { useClass: MongoRepoRepository });
container.register(TOKENS.IGetFilesUseCase, { useClass: GetFilesUseCase });
container.register(TOKENS.IGetFileContentUseCase, { useClass: GetFileContentUseCase });
container.register(TOKENS.IGetCommitsUseCase, { useClass: GetCommitUseCase });
container.register(TOKENS.IGetBranchesUseCase, { useClass: GetBranchesUseCase });

// PR use cases
container.register(TOKENS.ICreatePRUseCase, { useClass: CreatePRUseCase });
container.register(TOKENS.IGetPRUseCase, { useClass: GetPRUseCase });
container.register(TOKENS.IListPRsUseCase, { useClass: ListPRUseCase });
container.register(TOKENS.IMergePRUseCase, { useClass: MergePRUseCase });
container.register(TOKENS.IClosePRUseCase, { useClass: ClosePRUseCase });

// Issue use cases
container.register(TOKENS.ICreateIssueUseCase, { useClass: CreateIssueUseCase });
container.register(TOKENS.IGetIssueUseCase, { useClass: GetIssueUseCase });
container.register(TOKENS.IListIssuesUseCase, { useClass: ListIssueUseCase });
container.register(TOKENS.ICloseIssueUseCase, { useClass: CloseIssueUseCase });

//follow useCase
container.register(TOKENS.IFollowRepository, { useClass: MongoFollowRepository });
container.register(TOKENS.IFollowUseCase, { useClass: FollowUseCase });
container.register(TOKENS.IUnfollowUseCase, { useClass: UnfollowUseCase });
container.register(TOKENS.IGetFollowersUseCase, { useClass: GetFollowersUseCase });
container.register(TOKENS.IGetFollowingUseCase, { useClass: GetFollowingUseCase });

//branch usecase
container.register(TOKENS.ICreateBranchUseCase, { useClass: CreateBranchUseCase });
container.register(TOKENS.IDeleteBranchUseCase, { useClass: DeleteBranchUseCase });

//commit usecase
container.register(TOKENS.ICreateCommitUseCase, { useClass: CreateCommitUseCase });
container.register(TOKENS.ICompareCommitUseCase, { useClass: CompareCommitUseCase });

container.register(TOKENS.IGetProfileUseCase, { useClass: GetProfileUseCase });
container.register(TOKENS.IUpdateProfileUseCase, { useClass: UpdateProfileUseCase });

//repos
container.register(TOKENS.IAdminRepoRepository, { useClass: MongoAdminRepoRepository });
container.register(TOKENS.IGetAllRepoUseCase, { useClass: GetAllRepoUseCase });
container.register(TOKENS.IBlockRepoUseCase, { useClass: BlockRepoUseCase });
container.register(TOKENS.IUnblockRepoUseCase, { useClass: UnblockRepoUseCase });
container.register(TOKENS.IGetRepoByIdUseCase, { useClass: GetRepoByIdUseCase });

//collabs
container.register(TOKENS.ICollaboratorRepository, { useClass: MongoCollaboratorRepository });
container.register(TOKENS.IAddCollaboratorUseCase, { useClass: AddCollaboratorUseCase });
container.register(TOKENS.IRemoveCollaboratorUseCase, { useClass: RemoveCollaboratorUseCase });
container.register(TOKENS.IGetCollaboratorUseCase, { useClass: GetCollaboratorUseCase });
container.register(TOKENS.IUpdateCollaboratorUseCase, { useClass: UpdateCollaboratorUseCase });
container.register(TOKENS.ICheckCollaboratorUseCase, { useClass: CheckCollaboratorUseCase });
container.register(TOKENS.IInvitationRepository, { useClass: MongoInvitationRepository });
container.register(TOKENS.ISendInvitationUseCase, { useClass: SendInvitationUseCase });
container.register(TOKENS.IAcceptInvitationUseCase, { useClass: AcceptInvitationUseCase });
container.register(TOKENS.IDeclineInvitationUseCase, { useClass: DeclineInvitationUseCase });
container.register(TOKENS.IGetInvitationByTokenUseCase, { useClass: GetInvitationByTokenUseCase });
container.register(TOKENS.IGetPendingInvitationsUseCase, {
  useClass: GetPendingInvitationsUseCase,
});
container.register(TOKENS.IGetAllCollabsUseCase, { useClass: GetAllCollabsUseCase });

//comments

container.register(TOKENS.ICommentRepository, { useClass: MongoCommentRepository });
container.register(TOKENS.ICreateCommentUseCase, { useClass: CreateCommentUseCase });
container.register(TOKENS.IListCommentUseCase, { useClass: ListCommentUseCase });
container.register(TOKENS.IDeleteCommentUseCase, { useClass: DeleteCommentUseCase });

export { container };
