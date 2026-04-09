export interface RepoResponseDTO {
  id: string;
  name: string;
  description?: string;
  visibility: string;
  ownerId: string;
  ownerUsername: string;
  defaultBranch: string;
  stars: number;
  forks: number;
  size: number;
  isBlocked: boolean;
  isFork?: boolean;
  parentRepoOwnerUsername?: string;
  starredBy?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ToggleStarDTO {
  userId: string;
  ownerUsername: string;
  repoName: string;
}
