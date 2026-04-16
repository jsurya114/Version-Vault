import { RepositoryResponseDTO } from '../repository/repositoryTypes';
export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIAgentBackendResponse {
  status: 'ongoing' | 'completed';
  response: string;
  repo?: RepositoryResponseDTO;
}

export interface HTTPServiceResponse {
  success: boolean;
  data: AIAgentBackendResponse;
}

export interface AiAgentState {
  messages: AIChatMessage[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}
export const initialState: AiAgentState = {
  messages: [],
  status: 'idle',
  error: null,
};

export interface ProjectConfigFormData {
  name: string;
  description: string;
  projectBrief: string;
  visibility: string;
  techStack: string[];
  architecture: string;
  dependencies: string;
}
