export interface IAcceptInvitationUseCase {
  execute(token: string, userId: string, userEmail: string, username: string): Promise<void>;
}
