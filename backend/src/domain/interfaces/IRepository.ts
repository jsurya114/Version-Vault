import { RepositoryVisibility } from '../enums';

export interface IRepository {
  id?: string;
  name: string;
  description?: string;
  visibility: RepositoryVisibility;
  ownerId: string;
  ownerUsername: string;
  defaultBranch: string;
  stars: number;
  forks: number;
  size: number;
  isDeleted: boolean;
  isBlocked: boolean;
  isFork?: boolean;
  parentRepoId?: string;
  parentRepoOwnerUsername?: string;
  starredBy?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  role?: string;
}
