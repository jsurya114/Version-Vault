export interface IUnfollowUseCase {
  execute(followerId: string, followingId: string): Promise<void>;
}
