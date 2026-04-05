import axiosInstance from './axiosInstance';
import { COLLABORATOR_ENDPOINTS } from '../constants/api';

export const collaboratorService = {
  // Owner sends invitation
  sendInvitation: async (
    username: string,
    reponame: string,
    inviteeEmail: string,
    role: string,
  ) => {
    const res = await axiosInstance.post(
      `${COLLABORATOR_ENDPOINTS.BASE}/${username}/${reponame}/invite`,
      { inviteeEmail, role },
    );
    return res.data;
  },
  // Get invitation details by token (no auth needed)
  getInvitationByToken: async (token: string) => {
    const res = await axiosInstance.get(`${COLLABORATOR_ENDPOINTS.BASE}/invitation/${token}`);
    return res.data.data;
  },
  // Accept invitation (auth required)
  acceptInvitation: async (token: string) => {
    const res = await axiosInstance.post(
      `${COLLABORATOR_ENDPOINTS.BASE}/invitation/${token}/accept`,
    );
    return res.data;
  },
  // Decline invitation (auth required)
  declineInvitation: async (token: string) => {
    const res = await axiosInstance.post(
      `${COLLABORATOR_ENDPOINTS.BASE}/invitation/${token}/decline`,
    );
    return res.data;
  },
  // Get all collaborators of a repo
  getCollaborators: async (username: string, reponame: string) => {
    const res = await axiosInstance.get(`${COLLABORATOR_ENDPOINTS.BASE}/${username}/${reponame}`);
    return res.data.data;
  },
  // Get pending invitations for logged-in user
  getPendingInvitations: async () => {
    const res = await axiosInstance.get(`${COLLABORATOR_ENDPOINTS.BASE}/invitations/pending`);
    return res.data.data;
  },
  checkAccess: async (username: string, reponame: string) => {
    const res = await axiosInstance.get(
      `${COLLABORATOR_ENDPOINTS.BASE}/${username}/${reponame}/check`,
    );
    return res.data.data;
  },
  updateRole: async (
    username: string,
    reponame: string,
    collaboratorUsername: string,
    role: string,
  ) => {
    const res = await axiosInstance.patch(
      `${COLLABORATOR_ENDPOINTS.BASE}/${username}/${reponame}/${collaboratorUsername}`,
      { role },
    );
    return res.data.data;
  },
  removeCollaborator: async (username: string, reponame: string, collaboratorUsername: string) => {
    const res = await axiosInstance.delete(
      `${COLLABORATOR_ENDPOINTS.BASE}/${username}/${reponame}/${collaboratorUsername}`,
    );
    return res.data;
  },
  getAllCollabs: async () => {
    const res = await axiosInstance.get(`${COLLABORATOR_ENDPOINTS.BASE}/repos`);
    return res.data.data;
  },
};
