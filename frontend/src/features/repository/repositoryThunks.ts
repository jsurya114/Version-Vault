import { createAsyncThunk } from '@reduxjs/toolkit';
import { repositoryService } from 'src/services/repository.service';
import {
  RepositoryResponseDTO,
  CreateRepositoryDTO,
  RepoParams,
} from 'src/types/repository/repositoryTypes';
import { PaginatedResponse, PaginationQuery } from 'src/types/common/Pagination/paginationTypes';

export const createRepositoryThunk = createAsyncThunk<RepositoryResponseDTO, CreateRepositoryDTO>(
  'repository/create',
  async (dto, { rejectWithValue }) => {
    try {
      const response = await repositoryService.createRepository(dto);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create repository');
    }
  },
);

export const listRepositoryThunk = createAsyncThunk<
  PaginatedResponse<RepositoryResponseDTO>,
  PaginationQuery
>('repository/list', async (query = {}, { rejectWithValue }) => {
  try {
    const response = await repositoryService.listRepositories(query);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch repositories');
  }
});

export const getRepositoryThunk = createAsyncThunk<RepositoryResponseDTO, RepoParams>(
  'repository/get',
  async ({ username, reponame }, { rejectWithValue }) => {
    try {
      const response = await repositoryService.getRepository(username, reponame);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch repository');
    }
  },
);

export const deleteRepositoryThunk = createAsyncThunk<void, RepoParams>(
  'repository/delete',
  async ({ username, reponame }, { rejectWithValue }) => {
    try {
      const reponse = await repositoryService.deleteRepository(username, reponame);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete repository');
    }
  },
);
