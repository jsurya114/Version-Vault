import { createAsyncThunk } from '@reduxjs/toolkit';
import { aiAgentService } from '../../services/ai-agent.service';
import { AIAgentBackendResponse, ProjectConfigFormData } from '../../types/ai-agent/aiAgentTypes';

export const sendAgentMessageThunk = createAsyncThunk<
  AIAgentBackendResponse,
  ProjectConfigFormData
>('aiAgent/sendMessage', async (formData: ProjectConfigFormData, { rejectWithValue }) => {
  try {
    const response = await aiAgentService.sendChatMessage(formData);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to communicate with AI Agent');
  }
});
