"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
require("reflect-metadata");
const tsyringe_1 = require("tsyringe");
Object.defineProperty(exports, "container", { enumerable: true, get: function () { return tsyringe_1.container; } });
//tokens
const tokens_1 = require("./shared/constants/tokens");
//repositories
const MongoUserRepository_1 = require("./infrastructure/database/mongoose/repositories/MongoUserRepository");
const MongoAdminRepository_1 = require("./infrastructure/database/mongoose/repositories/MongoAdminRepository");
const MongoRepoRepository_1 = require("./infrastructure/database/mongoose/repositories/MongoRepoRepository");
//services
const HashService_1 = require("./infrastructure/services/HashService");
const TokenService_1 = require("./infrastructure/services/TokenService");
const OtpService_1 = require("./infrastructure/services/OtpService");
const NodemailerService_1 = require("./infrastructure/external/email/NodemailerService");
const GoogleAuthService_1 = require("./infrastructure/services/GoogleAuthService");
const GitService_1 = require("./infrastructure/services/GitService");
const WinstonLogger_1 = require("./infrastructure/services/WinstonLogger");
const GroqService_1 = require("./infrastructure/services/GroqService");
//validator
const RegisterValidator_1 = require("./application/use-cases/validators/RegisterValidator");
const VerifyOtpValidator_1 = require("./application/use-cases/validators/VerifyOtpValidator");
const LoginValidator_1 = require("./application/use-cases/validators/LoginValidator");
//usecases
const RegisterUseCase_1 = require("./application/use-cases/auth/RegisterUseCase");
const VerifyOtpUseCase_1 = require("./application/use-cases/auth/VerifyOtpUseCase");
const LoginUseCase_1 = require("./application/use-cases/auth/LoginUseCase");
const GoogleAuthUseCase_1 = require("./application/use-cases/auth/GoogleAuthUseCase");
const LogoutUseCase_1 = require("./application/use-cases/auth/LogoutUseCase");
const RefreshTokenUseCase_1 = require("./application/use-cases/auth/RefreshTokenUseCase");
const GetMeUseCase_1 = require("./application/use-cases/auth/GetMeUseCase");
const ForgotPasswordUseCase_1 = require("./application/use-cases/auth/ForgotPasswordUseCase");
const ResendOtpUseCase_1 = require("./application/use-cases/auth/ResendOtpUseCase");
const ResetPasswordUseCase_1 = require("./application/use-cases/auth/ResetPasswordUseCase");
const VerifyResetOtpUseCase_1 = require("./application/use-cases/auth/VerifyResetOtpUseCase");
// admin use cases
const GetAllUsersUseCase_1 = require("./application/use-cases/admin/GetAllUsersUseCase");
const GetUserByIdUseCase_1 = require("./application/use-cases/admin/GetUserByIdUseCase");
const BlockUserUseCase_1 = require("./application/use-cases/admin/BlockUserUseCase");
const UnblockUserUseCase_1 = require("./application/use-cases/admin/UnblockUserUseCase");
//repositories
const CreateRepoUseCase_1 = require("./application/use-cases/repository/CreateRepoUseCase");
const GetRepoUseCase_1 = require("./application/use-cases/repository/GetRepoUseCase");
const ListRepositoryUseCase_1 = require("./application/use-cases/repository/ListRepositoryUseCase");
const DeleteRepoUseCase_1 = require("./application/use-cases/repository/DeleteRepoUseCase");
//git file browser use case
const GetFilesUseCase_1 = require("./application/use-cases/repository/GetFilesUseCase");
const GetFileContentUseCase_1 = require("./application/use-cases/repository/GetFileContentUseCase");
const GetCommitUseCase_1 = require("./application/use-cases/repository/GetCommitUseCase");
const GetBranchUseCase_1 = require("./application/use-cases/branch/GetBranchUseCase");
//pr usecase
const GetPRUseCase_1 = require("./application/use-cases/pullrequest/GetPRUseCase");
const ListPRUseCase_1 = require("./application/use-cases/pullrequest/ListPRUseCase");
const CreatePRUseCase_1 = require("./application/use-cases/pullrequest/CreatePRUseCase");
const MergePRUseCase_1 = require("./application/use-cases/pullrequest/MergePRUseCase");
const ClosePRUseCase_1 = require("./application/use-cases/pullrequest/ClosePRUseCase");
const GetConflictsUseCase_1 = require("./application/use-cases/pullrequest/GetConflictsUseCase");
const ResolveConflictsUseCase_1 = require("./application/use-cases/pullrequest/ResolveConflictsUseCase");
//issues pr usecase
const GetIssuesUseCase_1 = require("./application/issues/GetIssuesUseCase");
const ListIssueUseCase_1 = require("./application/issues/ListIssueUseCase");
const CreateIssueUseCase_1 = require("./application/issues/CreateIssueUseCase");
const CloseIssueUseCase_1 = require("./application/issues/CloseIssueUseCase");
const MongoPullRequestRepository_1 = require("./infrastructure/database/mongoose/repositories/MongoPullRequestRepository");
const MongoIssuesRepository_1 = require("./infrastructure/database/mongoose/repositories/MongoIssuesRepository");
//follow usecase
const MongoFollowRepository_1 = require("./infrastructure/database/mongoose/repositories/MongoFollowRepository");
const FollowUseCase_1 = require("./application/use-cases/follow/FollowUseCase");
const UnFollowUseCase_1 = require("./application/use-cases/follow/UnFollowUseCase");
const GetFollowerUseCase_1 = require("./application/use-cases/follow/GetFollowerUseCase");
const GetFollowingUseCase_1 = require("./application/use-cases/follow/GetFollowingUseCase");
//branch
const CreateBranchUseCase_1 = require("./application/use-cases/branch/CreateBranchUseCase");
const DeleteBranchUseCase_1 = require("./application/use-cases/branch/DeleteBranchUseCase");
const MongoBranchRepository_1 = require("./infrastructure/database/mongoose/repositories/MongoBranchRepository");
const CreateCommitUseCase_1 = require("./application/use-cases/commit/CreateCommitUseCase");
const CompareCommitUseCase_1 = require("./application/use-cases/commit/CompareCommitUseCase");
//profile
const GetProfileUseCase_1 = require("./application/use-cases/user/GetProfileUseCase");
const UpdateProfileUseCase_1 = require("./application/use-cases/user/UpdateProfileUseCase");
//repos
const MongoAdminRepoRepository_1 = require("./infrastructure/database/mongoose/repositories/MongoAdminRepoRepository");
const GetAllRepoUseCase_1 = require("./application/use-cases/admin/GetAllRepoUseCase");
const GetRepoByIdUseCase_1 = require("./application/use-cases/admin/GetRepoByIdUseCase");
const BlockRepoUseCase_1 = require("./application/use-cases/admin/BlockRepoUseCase");
const UnblockRepoUseCase_1 = require("./application/use-cases/admin/UnblockRepoUseCase");
const VisibilityUseCase_1 = require("./application/use-cases/repository/VisibilityUseCase");
const ForkRepoUseCase_1 = require("./application/use-cases/repository/ForkRepoUseCase");
//collaborators
const MongoCollaboratorRepository_1 = require("./infrastructure/database/mongoose/repositories/MongoCollaboratorRepository");
const MongoInvitationRepository_1 = require("./infrastructure/database/mongoose/repositories/MongoInvitationRepository");
const AddCollaboratorUseCase_1 = require("./application/use-cases/collaborators/AddCollaboratorUseCase");
const RemoveCollaboratorUseCase_1 = require("./application/use-cases/collaborators/RemoveCollaboratorUseCase");
const UpdateCollaboratorUseCase_1 = require("./application/use-cases/collaborators/UpdateCollaboratorUseCase");
const GetCollaboratorUseCase_1 = require("./application/use-cases/collaborators/GetCollaboratorUseCase");
const CheckCollaboratorUseCase_1 = require("./application/use-cases/collaborators/CheckCollaboratorUseCase");
const SendInvitationUseCase_1 = require("./application/use-cases/collaborators/SendInvitationUseCase");
const AcceptInvitationUseCase_1 = require("./application/use-cases/collaborators/AcceptInvitationUseCase");
const DeclineInvitationUseCase_1 = require("./application/use-cases/collaborators/DeclineInvitationUseCase");
const GetInvitationByTokenUseCase_1 = require("./application/use-cases/collaborators/GetInvitationByTokenUseCase");
const GetPendingInvitationsUseCase_1 = require("./application/use-cases/collaborators/GetPendingInvitationsUseCase");
const GetAllCollabsUseCase_1 = require("./application/use-cases/collaborators/GetAllCollabsUseCase");
//comments
const MongoCommentRepository_1 = require("./infrastructure/database/mongoose/repositories/MongoCommentRepository");
const CreateCommentUseCase_1 = require("./application/use-cases/comments/CreateCommentUseCase");
const ListCommentUseCase_1 = require("./application/use-cases/comments/ListCommentUseCase");
const DeleteCommentUseCase_1 = require("./application/use-cases/comments/DeleteCommentUseCase");
const ToggleStarUseCase_1 = require("./application/use-cases/repository/ToggleStarUseCase");
const GetStarsUsecase_1 = require("./application/use-cases/repository/GetStarsUsecase");
//chats
const SendMessageUseCase_1 = require("./application/use-cases/chats/SendMessageUseCase");
const GetChatHistoryUseCase_1 = require("./application/use-cases/chats/GetChatHistoryUseCase");
const GetMessageUseCase_1 = require("./application/use-cases/chats/GetMessageUseCase");
const DeleteMessageUseCase_1 = require("./application/use-cases/chats/DeleteMessageUseCase");
const MongoChatRepository_1 = require("./infrastructure/database/mongoose/repositories/MongoChatRepository");
const SocketService_1 = require("./infrastructure/services/SocketService");
const LIstChatRepoUseCase_1 = require("./application/use-cases/chats/LIstChatRepoUseCase");
const UploadFileUsecase_1 = require("./application/use-cases/repository/UploadFileUsecase");
const GetActiveBranchUseCase_1 = require("./application/use-cases/repository/GetActiveBranchUseCase");
const AIAgentUseCase_1 = require("./application/use-cases/AIAgent/AIAgentUseCase");
const DeleteFileUseCase_1 = require("./application/use-cases/repository/DeleteFileUseCase");
//notifications
const MongoNotificationRepository_1 = require("./infrastructure/database/mongoose/repositories/MongoNotificationRepository");
const NotificationService_1 = require("./infrastructure/services/NotificationService");
const GetNotificationsUseCase_1 = require("./application/use-cases/notifications/GetNotificationsUseCase");
const MarkNotificationReadUseCase_1 = require("./application/use-cases/notifications/MarkNotificationReadUseCase");
const MarkAllReadUseCase_1 = require("./application/use-cases/notifications/MarkAllReadUseCase");
const DownloadZipUseCase_1 = require("./application/use-cases/repository/DownloadZipUseCase");
const RenameBranchUseCase_1 = require("./application/use-cases/branch/RenameBranchUseCase");
const MongoActivityRepository_1 = require("./infrastructure/database/mongoose/repositories/MongoActivityRepository");
const RecordActivityUseCase_1 = require("./application/use-cases/activity/RecordActivityUseCase");
const GetFeedActivityUseCase_1 = require("./application/use-cases/activity/GetFeedActivityUseCase");
const StripeService_1 = require("./infrastructure/services/StripeService");
const GetSubscriptionStatusUseCase_1 = require("./application/use-cases/subscription/GetSubscriptionStatusUseCase");
const HandleWebhookUsecase_1 = require("./application/use-cases/subscription/HandleWebhookUsecase");
const CancelSubscriptionUseCase_1 = require("./application/use-cases/subscription/CancelSubscriptionUseCase");
const CreateCheckoutUseCase_1 = require("./application/use-cases/subscription/CreateCheckoutUseCase");
//cicd
const YAMLParserService_1 = require("./infrastructure/services/cicd/YAMLParserService");
const DockerRunnerService_1 = require("./infrastructure/services/cicd/DockerRunnerService");
const TriggerWorkflowUseCase_1 = require("./application/use-cases/cicd/TriggerWorkflowUseCase");
const ListWorkflowRunsUseCase_1 = require("./application/use-cases/cicd/ListWorkflowRunsUseCase");
const GetWorkflowRunUseCase_1 = require("./application/use-cases/cicd/GetWorkflowRunUseCase");
const GetLatestWorkflowStatusUseCase_1 = require("./application/use-cases/cicd/GetLatestWorkflowStatusUseCase");
//services
tsyringe_1.container.register(tokens_1.TOKENS.IHashService, { useClass: HashService_1.HashService });
tsyringe_1.container.register(tokens_1.TOKENS.ITokenService, { useClass: TokenService_1.TokenService });
tsyringe_1.container.register(tokens_1.TOKENS.IOtpService, { useClass: OtpService_1.OtpService });
tsyringe_1.container.register(tokens_1.TOKENS.IEmailService, { useClass: NodemailerService_1.NodemailerService });
tsyringe_1.container.register(tokens_1.TOKENS.IGoogleAuthService, { useClass: GoogleAuthService_1.GoogleAuthService });
tsyringe_1.container.registerSingleton(GitService_1.GitService, GitService_1.GitService);
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.ILogger, WinstonLogger_1.WinstonLogger);
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.ISocketEmitter, SocketService_1.SocketService);
tsyringe_1.container.register(tokens_1.TOKENS.IGroqService, { useClass: GroqService_1.GroqService });
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.NotificationService, NotificationService_1.NotificationService);
//repositories
tsyringe_1.container.register(tokens_1.TOKENS.IUserRepository, { useClass: MongoUserRepository_1.MongoUserRepository });
tsyringe_1.container.register(tokens_1.TOKENS.IAdminRepository, { useClass: MongoAdminRepository_1.MongoAdminRepository });
tsyringe_1.container.register(tokens_1.TOKENS.IPullRequestRepository, { useClass: MongoPullRequestRepository_1.MongoPullRequestRepository });
tsyringe_1.container.register(tokens_1.TOKENS.IIssuesRepository, { useClass: MongoIssuesRepository_1.MongoIssuesRepository });
//validator
tsyringe_1.container.register(RegisterValidator_1.RegisterValidator, { useClass: RegisterValidator_1.RegisterValidator });
tsyringe_1.container.register(VerifyOtpValidator_1.VerifyOtpValidator, { useClass: VerifyOtpValidator_1.VerifyOtpValidator });
tsyringe_1.container.register(LoginValidator_1.LoginValidator, { useClass: LoginValidator_1.LoginValidator });
//useCase
tsyringe_1.container.register(tokens_1.TOKENS.IRegisterUseCase, { useClass: RegisterUseCase_1.RegisterUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IVerifyUseCase, { useClass: VerifyOtpUseCase_1.VerifyOtpUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.ILoginUseCase, { useClass: LoginUseCase_1.LoginUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IGoogleAuthUseCase, { useClass: GoogleAuthUseCase_1.GoogleAuthUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IRefreshTokenUseCase, { useClass: RefreshTokenUseCase_1.RefreshTokenUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.ILogoutUseCase, { useClass: LogoutUseCase_1.LogoutUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IGetMeUseCase, { useClass: GetMeUseCase_1.GetMeUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IGetAllUsersUseCase, { useClass: GetAllUsersUseCase_1.GetAllUsersUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IForgotPasswordUseCase, { useClass: ForgotPasswordUseCase_1.ForgotPasswordUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IResetPasswordUseCase, { useClass: ResetPasswordUseCase_1.ResetPasswordUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IResendOtpUseCase, { useClass: ResendOtpUseCase_1.ResendOtpUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IVerifyResetOtpUseCase, { useClass: VerifyResetOtpUseCase_1.VerifyResetOtpUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IGetUserByIdUseCase, { useClass: GetUserByIdUseCase_1.GetUserByIdUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IBlockUserUseCase, { useClass: BlockUserUseCase_1.BlockUserUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IUnblockUserUseCase, { useClass: UnblockUserUseCase_1.UnblockUserUseCase });
//repository
tsyringe_1.container.register(tokens_1.TOKENS.IGetRepoUseCase, { useClass: GetRepoUseCase_1.GetRepoUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.ICreateRepoUseCase, { useClass: CreateRepoUseCase_1.CreateRepoUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IListRepoUseCase, { useClass: ListRepositoryUseCase_1.ListRepoUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IDeleteRepoUseCase, { useClass: DeleteRepoUseCase_1.DeleteRepoUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IVisibilityUseCase, { useClass: VisibilityUseCase_1.VisibilityUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IRepoRepository, { useClass: MongoRepoRepository_1.MongoRepoRepository });
tsyringe_1.container.register(tokens_1.TOKENS.IGetFilesUseCase, { useClass: GetFilesUseCase_1.GetFilesUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IGetFileContentUseCase, { useClass: GetFileContentUseCase_1.GetFileContentUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IGetCommitsUseCase, { useClass: GetCommitUseCase_1.GetCommitUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IGetBranchesUseCase, { useClass: GetBranchUseCase_1.GetBranchesUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IDeleteFileUseCase, { useClass: DeleteFileUseCase_1.DeleteFileUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IDownloadZipUseCase, { useClass: DownloadZipUseCase_1.DownloadZipUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IRenameBranchUseCase, { useClass: RenameBranchUseCase_1.RenameBranchUseCase });
//ai agent
tsyringe_1.container.register(tokens_1.TOKENS.IAIAgentUseCase, { useClass: AIAgentUseCase_1.AIAgentUseCase });
// PR use cases
tsyringe_1.container.register(tokens_1.TOKENS.ICreatePRUseCase, { useClass: CreatePRUseCase_1.CreatePRUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IGetPRUseCase, { useClass: GetPRUseCase_1.GetPRUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IListPRsUseCase, { useClass: ListPRUseCase_1.ListPRUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IMergePRUseCase, { useClass: MergePRUseCase_1.MergePRUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IClosePRUseCase, { useClass: ClosePRUseCase_1.ClosePRUseCase });
// Issue use cases
tsyringe_1.container.register(tokens_1.TOKENS.ICreateIssueUseCase, { useClass: CreateIssueUseCase_1.CreateIssueUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IGetIssueUseCase, { useClass: GetIssuesUseCase_1.GetIssueUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IListIssuesUseCase, { useClass: ListIssueUseCase_1.ListIssueUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.ICloseIssueUseCase, { useClass: CloseIssueUseCase_1.CloseIssueUseCase });
//follow useCase
tsyringe_1.container.register(tokens_1.TOKENS.IFollowRepository, { useClass: MongoFollowRepository_1.MongoFollowRepository });
tsyringe_1.container.register(tokens_1.TOKENS.IFollowUseCase, { useClass: FollowUseCase_1.FollowUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IUnfollowUseCase, { useClass: UnFollowUseCase_1.UnfollowUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IGetFollowersUseCase, { useClass: GetFollowerUseCase_1.GetFollowersUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IGetFollowingUseCase, { useClass: GetFollowingUseCase_1.GetFollowingUseCase });
//branch usecase
tsyringe_1.container.register(tokens_1.TOKENS.IBranchRepository, { useClass: MongoBranchRepository_1.MongoBranchRepository });
tsyringe_1.container.register(tokens_1.TOKENS.ICreateBranchUseCase, { useClass: CreateBranchUseCase_1.CreateBranchUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IDeleteBranchUseCase, { useClass: DeleteBranchUseCase_1.DeleteBranchUseCase });
//commit usecase
tsyringe_1.container.register(tokens_1.TOKENS.ICreateCommitUseCase, { useClass: CreateCommitUseCase_1.CreateCommitUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.ICompareCommitUseCase, { useClass: CompareCommitUseCase_1.CompareCommitUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IGetProfileUseCase, { useClass: GetProfileUseCase_1.GetProfileUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IUpdateProfileUseCase, { useClass: UpdateProfileUseCase_1.UpdateProfileUseCase });
//repos
tsyringe_1.container.register(tokens_1.TOKENS.IAdminRepoRepository, { useClass: MongoAdminRepoRepository_1.MongoAdminRepoRepository });
tsyringe_1.container.register(tokens_1.TOKENS.IGetAllRepoUseCase, { useClass: GetAllRepoUseCase_1.GetAllRepoUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IBlockRepoUseCase, { useClass: BlockRepoUseCase_1.BlockRepoUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IUnblockRepoUseCase, { useClass: UnblockRepoUseCase_1.UnblockRepoUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IGetRepoByIdUseCase, { useClass: GetRepoByIdUseCase_1.GetRepoByIdUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IForkRepoUseCase, { useClass: ForkRepoUseCase_1.ForkRepoUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IToggleStarUseCase, { useClass: ToggleStarUseCase_1.ToggleStarUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IGetStarsUseCase, { useClass: GetStarsUsecase_1.GetStarsUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IUploadFileUseCase, { useClass: UploadFileUsecase_1.UploadFileUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IGetActiveBranchUseCase, { useClass: GetActiveBranchUseCase_1.GetActiveBranchUseCase });
//chats
tsyringe_1.container.register(tokens_1.TOKENS.ISendMessageUseCase, { useClass: SendMessageUseCase_1.SendMessageUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IGetChatHistoryUseCase, { useClass: GetChatHistoryUseCase_1.GetChatHistoryUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IGetMessageUsecase, { useClass: GetMessageUseCase_1.GetMessageUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IDeleteMessageUseCase, { useClass: DeleteMessageUseCase_1.DeleteMessageUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IChatRepository, { useClass: MongoChatRepository_1.MongoChatRepository });
//collabs
tsyringe_1.container.register(tokens_1.TOKENS.ICollaboratorRepository, { useClass: MongoCollaboratorRepository_1.MongoCollaboratorRepository });
tsyringe_1.container.register(tokens_1.TOKENS.IAddCollaboratorUseCase, { useClass: AddCollaboratorUseCase_1.AddCollaboratorUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IRemoveCollaboratorUseCase, { useClass: RemoveCollaboratorUseCase_1.RemoveCollaboratorUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IGetCollaboratorUseCase, { useClass: GetCollaboratorUseCase_1.GetCollaboratorUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IUpdateCollaboratorUseCase, { useClass: UpdateCollaboratorUseCase_1.UpdateCollaboratorUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.ICheckCollaboratorUseCase, { useClass: CheckCollaboratorUseCase_1.CheckCollaboratorUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IInvitationRepository, { useClass: MongoInvitationRepository_1.MongoInvitationRepository });
tsyringe_1.container.register(tokens_1.TOKENS.ISendInvitationUseCase, { useClass: SendInvitationUseCase_1.SendInvitationUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IAcceptInvitationUseCase, { useClass: AcceptInvitationUseCase_1.AcceptInvitationUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IDeclineInvitationUseCase, { useClass: DeclineInvitationUseCase_1.DeclineInvitationUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IGetInvitationByTokenUseCase, { useClass: GetInvitationByTokenUseCase_1.GetInvitationByTokenUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IGetPendingInvitationsUseCase, {
    useClass: GetPendingInvitationsUseCase_1.GetPendingInvitationsUseCase,
});
tsyringe_1.container.register(tokens_1.TOKENS.IGetAllCollabsUseCase, { useClass: GetAllCollabsUseCase_1.GetAllCollabsUseCase });
//comments
tsyringe_1.container.register(tokens_1.TOKENS.ICommentRepository, { useClass: MongoCommentRepository_1.MongoCommentRepository });
tsyringe_1.container.register(tokens_1.TOKENS.ICreateCommentUseCase, { useClass: CreateCommentUseCase_1.CreateCommentUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IListCommentUseCase, { useClass: ListCommentUseCase_1.ListCommentUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IDeleteCommentUseCase, { useClass: DeleteCommentUseCase_1.DeleteCommentUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IListChatRepoUseCase, { useClass: LIstChatRepoUseCase_1.ListChatRepoUseCase });
//pr
tsyringe_1.container.register(tokens_1.TOKENS.IGetConflictsUseCase, { useClass: GetConflictsUseCase_1.GetConflictsUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IResolveConflictsUseCase, { useClass: ResolveConflictsUseCase_1.ResolveConflictsUseCase });
//notifications
tsyringe_1.container.register(tokens_1.TOKENS.INotificationRepository, { useClass: MongoNotificationRepository_1.MongoNotificationRepository });
tsyringe_1.container.register(tokens_1.TOKENS.IGetNotificationsUseCase, { useClass: GetNotificationsUseCase_1.GetNotificationsUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IMarkNotificationReadUseCase, { useClass: MarkNotificationReadUseCase_1.MarkNotificationReadUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IMarkAllReadUseCase, { useClass: MarkAllReadUseCase_1.MarkAllReadUseCase });
//activity
tsyringe_1.container.register(tokens_1.TOKENS.IRecordActivityUseCase, { useClass: RecordActivityUseCase_1.RecordActivityUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IActivityRepository, { useClass: MongoActivityRepository_1.MongoActivityRepository });
tsyringe_1.container.register(tokens_1.TOKENS.IGetActivityFeedUseCase, { useClass: GetFeedActivityUseCase_1.GetActivityFeedUseCase });
//subscription
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.IPaymentService, StripeService_1.StripeService);
tsyringe_1.container.register(tokens_1.TOKENS.IGetSubscriptionStatusUseCase, {
    useClass: GetSubscriptionStatusUseCase_1.GetSubscriptionStatusUseCase,
});
tsyringe_1.container.register(tokens_1.TOKENS.IHandleWebhookUseCase, { useClass: HandleWebhookUsecase_1.HandleWebhookUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.ICancelSubscriptionUseCase, { useClass: CancelSubscriptionUseCase_1.CancelSubscriptionUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.ICreateCheckoutUseCase, { useClass: CreateCheckoutUseCase_1.CreateCheckoutUseCase });
//cicd
tsyringe_1.container.registerSingleton(YAMLParserService_1.YAMLParserService, YAMLParserService_1.YAMLParserService);
tsyringe_1.container.registerSingleton(DockerRunnerService_1.DockerRunnerService, DockerRunnerService_1.DockerRunnerService);
tsyringe_1.container.registerSingleton(TriggerWorkflowUseCase_1.TriggerWorkflowUseCase, TriggerWorkflowUseCase_1.TriggerWorkflowUseCase);
tsyringe_1.container.register(tokens_1.TOKENS.IListWorkflowRunsUseCase, { useClass: ListWorkflowRunsUseCase_1.ListWorkflowRunsUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IGetWorkflowRunUseCase, { useClass: GetWorkflowRunUseCase_1.GetWorkflowRunUseCase });
tsyringe_1.container.register(tokens_1.TOKENS.IGetLatestWorkflowStatusUseCase, { useClass: GetLatestWorkflowStatusUseCase_1.GetLatestWorkflowStatusUseCase });
