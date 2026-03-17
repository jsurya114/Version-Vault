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
  createdAt?: Date;
  updatedAt?: Date;
}
