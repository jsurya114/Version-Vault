import { RepoVisibility } from './enums';

export interface IRepository {
  id: string;
  name: string;
  description?: string;
  visibility: RepoVisibility;
  ownerId: string;
  ownerUsername: string;
  isForked: boolean;
  forkedFromId?: string;
  isBlocked: boolean;
  stars: number;
  forks: number;
  defaultBranch: string;
  createdAt: Date;
  updatedAt: Date;
}