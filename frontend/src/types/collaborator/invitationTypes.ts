import { RepositoryResponseDTO } from '../repository/repositoryTypes';

export interface IInvitation {
  id: string;
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
  expiresAt: string;
  createdAt: string;
}
export interface CollabRepoWithRole {
  repo: RepositoryResponseDTO;
  role: string;
}

export interface InvitationState {
  currentInvitation: IInvitation | null;
  pendingInvitations: IInvitation[];
  collabRepos: CollabRepoWithRole[];
  collabReposLoading: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

export const initialState: InvitationState = {
  currentInvitation: null,
  pendingInvitations: [],
  collabRepos: [],
  collabReposLoading: false,
  isLoading: false,
  error: null,
  successMessage: null,
};
