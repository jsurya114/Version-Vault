export interface FollowDTO {
  id: string;
  followerId: string;
  followerUsername: string;
  followingId: string;
  followingUsername: string;
  createdAt?: string;
}

export interface FollowState {
  followers: FollowDTO[];
  following: FollowDTO[];
  isLoading: boolean;
  error: string | null;
}

export const followInitialState: FollowState = {
  followers: [],
  following: [],
  isLoading: false,
  error: null,
};
