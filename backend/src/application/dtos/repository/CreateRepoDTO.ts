export interface CreateRepoDTO {
  name: string;
  description?: string;
  visibility: 'public' | 'private';
  ownerId: string;
  ownerUsername: string;
}
