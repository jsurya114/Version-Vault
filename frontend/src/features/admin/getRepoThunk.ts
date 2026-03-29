import { createAsyncThunk } from '@reduxjs/toolkit';
import { adminService } from '../../services/admin.service';
import { RepositoryResponseDTO } from '../../types/repository/repositoryTypes';
import { PaginationQuery, PaginatedResponse } from '../../types/common/Pagination/paginationTypes';

export const getAllRepoThunk = createAsyncThunk<
  PaginatedResponse<RepositoryResponseDTO>,
  PaginationQuery
>('admin/getallRepo', async (query = {}, { rejectWithValue }) => {
  try {
    const response = await adminService.getAllRepos(query);
    return response;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch repositories');
  }
});

export const getRepoThunk = createAsyncThunk<RepositoryResponseDTO, string>(
  'admin/getRepo',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminService.getRepos(id);
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch repo');
    }
  },
);

export const blockRepoThunk = createAsyncThunk<RepositoryResponseDTO, string>(
  'admin/blockRepo',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminService.blockRepo(id);
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to block repository');
    }
  },
);
export const unblockRepoThunk = createAsyncThunk<RepositoryResponseDTO, string>(
  'admin/unblockRepo',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminService.unblockRepo(id);
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to unblock repository');
    }
  },
);
