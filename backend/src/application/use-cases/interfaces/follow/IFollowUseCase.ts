export interface IFollowUseCase {
  execute(
    followerId: string,
    followerUsername: string,
    followingId: string,
    followingUsername: string,
  ): Promise<void>;
}
