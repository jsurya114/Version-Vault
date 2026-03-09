import { createAsyncThunk } from '@reduxjs/toolkit';
import { adminService } from 'src/services/admin.service';
import { UserResponseDTO } from 'src/types/admin/adminTypes';

export const getAllUsersThunk = createAsyncThunk<UserResponseDTO[], void>(
  'admin/getAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getAllUsers();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  },
);
