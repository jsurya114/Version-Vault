import { createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from 'src/services/user.service';

export const getProfileThunk = createAsyncThunk(
  'user/getProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await userService.getProfile(userId);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch user profile');
    }
  },
);

export const updateProfileThunk = createAsyncThunk(
  'user/updateProfile',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await userService.updateProfile(formData);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Profile update failed');
    }
  },
);
