export interface IInvitation {
  id?: string;
  token: string;
  repositoryId: string;
  repositoryName: string;
  ownerId: string;
  ownerUsername: string;
  inviteeEmail: string;
  inviteeUserId?: string;
  inviteeUsername?: string;
  role: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: Date;
  createdAt?: Date;
}
