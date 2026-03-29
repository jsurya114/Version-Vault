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
  createdAt?: Date;
  updatedAt?: Date;
}
