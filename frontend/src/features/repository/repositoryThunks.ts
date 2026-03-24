import { createAsyncThunk } from '@reduxjs/toolkit';
import { repositoryService } from '../../services/repository.service';
import {
  RepositoryResponseDTO,
  CreateRepositoryDTO,
  RepoParams,
  GitFileEntry,
  GetFilesParams,
  GetFileContentParams,
  GetCommitsParams,
  GitCommit,
} from '../../types/repository/repositoryTypes';
import { PaginatedResponse, PaginationQuery } from '../../types/common/Pagination/paginationTypes';

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
      await repositoryService.deleteRepository(username, reponame);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete repository');
    }
  },
);

export const getFilesThunk = createAsyncThunk<GitFileEntry[], GetFilesParams>(
  'repository/getfiles',
  async ({ username, reponame, branch = 'main', path = '' }, { rejectWithValue }) => {
    try {
      return await repositoryService.getFiles(username, reponame, branch, path);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch files');
    }
  },
);

export const getFileContentThunk = createAsyncThunk<string, GetFileContentParams>(
  'repository/getfileContent',
  async ({ username, reponame, filePath, branch = 'main' }, { rejectWithValue }) => {
    try {
      return await repositoryService.getFileContent(username, reponame, filePath, branch);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch file content');
    }
  },
);

export const getCommitsThunk = createAsyncThunk<GitCommit, GetCommitsParams>(
  'repository/getcommits',
  async ({ username, reponame, branch = 'main', limit = 20 }, { rejectWithValue }) => {
    try {
      return await repositoryService.getCommits(username, reponame, branch, limit);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch commits');
    }
  },
);

export const getBranchesThunk = createAsyncThunk<string[], RepoParams>(
  'repository/getbranches',
  async ({ username, reponame }, { rejectWithValue }) => {
    try {
      return await repositoryService.getBranches(username, reponame);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch branches');
    }
  },
);
