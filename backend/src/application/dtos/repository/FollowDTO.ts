export interface FollowResponseDTO {
  id: string;
  followerId: string;
  followerUsername: string;
  followingId: string;
  followingUsername: string;
  createdAt?: Date;
}
