import { createAsyncThunk } from '@reduxjs/toolkit';
import { adminService } from 'src/services/admin.service';
import { UserResponseDTO } from 'src/types/admin/adminTypes';
import { PaginationQuery, PaginatedResponse } from '../../types/common/Pagination/paginationTypes';

export const getAllUsersThunk = createAsyncThunk<
  PaginatedResponse<UserResponseDTO>,
  PaginationQuery
>('admin/getAllUsers', async (query = {}, { rejectWithValue }) => {
  try {
    const response = await adminService.getAllUsers(query);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
  }
});

export const getUserByIdThunk = createAsyncThunk<UserResponseDTO, string>(
  'admin/getUserByid',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminService.getUserById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  },
);

export const blockUserThunk = createAsyncThunk<UserResponseDTO, string>(
  'admin/blockUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminService.blockUser(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to block user');
    }
  },
);

export const unBlockUserThunk = createAsyncThunk<UserResponseDTO, string>(
  'admin/unblockUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminService.unBlockUser(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unblock user');
    }
  },
);
