import { AIAGENT_ENDPOINTS } from '../constants/api';
import { HTTPServiceResponse, ProjectConfigFormData } from '../types/ai-agent/aiAgentTypes';
import axiosInstance from './axiosInstance';

export const aiAgentService = {
  sendChatMessage: async (formData: ProjectConfigFormData): Promise<HTTPServiceResponse> => {
    const res = await axiosInstance.post(`${AIAGENT_ENDPOINTS.BASE}/chat`, formData);
    return res.data;
  },
};
