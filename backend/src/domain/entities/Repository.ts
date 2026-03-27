import { IRepository } from '../interfaces/IRepository';

export class Repository {
  id?: string;
  name: string;
  description?: string;
  visibility: string;
  ownerId: string;
  ownerUsername: string;
  defaultBranch: string;
  stars: number;
  forks: number;
  size: number;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  constructor(props: IRepository) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.visibility = props.visibility;
    this.ownerId = props.ownerId;
    this.ownerUsername = props.ownerUsername;
    this.defaultBranch = props.defaultBranch ?? 'main';
    this.stars = props.stars ?? 0;
    this.forks = props.forks ?? 0;
    this.size = props.size ?? 0;
    this.isDeleted = props.isDeleted ?? false;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
