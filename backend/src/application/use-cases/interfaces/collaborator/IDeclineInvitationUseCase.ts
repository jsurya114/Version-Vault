export interface IDeclineInvitationUseCase {
  execute(token: string, userId: string, userEmail: string): Promise<void>;
}
