export interface IFollow {
  id?: string;
  followerId: string;
  followerUsername: string;
  followingId: string;
  followingUsername: string;
  createdAt?: Date;
}
