import { RepositoryResponseDTO } from '../repository/repositoryTypes';

export interface ChatMessage {
  id: string;
  repositoryId: string;
  senderId: string;
  senderUsername: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatState {
  messages: ChatMessage[];
  conversation: RepositoryResponseDTO[];
  selectedMessage: ChatMessage | null;
  isLoading: boolean;
  error: string | null;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const chatIntitialState: ChatState = {
  messages: [],
  conversation: [],
  selectedMessage: null,
  isLoading: false,
  error: null,
  meta: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

export interface FetchChatHistoryParams {
  username: string;
  reponame: string;
  page?: number;
  limit?: number;
}

export interface SendMessageHttpParams {
  username: string;
  reponame: string;
  content: string;
}
