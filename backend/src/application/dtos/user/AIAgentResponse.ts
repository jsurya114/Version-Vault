import { RepoResponseDTO } from '../../../application/dtos/repository/RepoResponseDTO';
export interface AIAgentResponse {
  status: 'ongoing' | 'completed';
  response: string;
  repo?: RepoResponseDTO;
}
export interface ProjectConfigDTO {
  name: string;
  description: string;
  projectBrief: string;
  visibility: string;
  techStack: string[];
  architecture: string;
  dependencies: string;
}
