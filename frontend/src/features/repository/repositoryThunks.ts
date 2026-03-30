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
  GitBranch,
} from '../../types/repository/repositoryTypes';
import { PaginatedResponse, PaginationQuery } from '../../types/common/Pagination/paginationTypes';
import { RootState } from '../../app/store';

export const createRepositoryThunk = createAsyncThunk<RepositoryResponseDTO, CreateRepositoryDTO>(
  'repository/create',
  async (dto, { rejectWithValue }) => {
    try {
      const response = await repositoryService.createRepository(dto);
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to create repository');
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
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch repositories');
  }
});

export const getRepositoryThunk = createAsyncThunk<RepositoryResponseDTO, RepoParams>(
  'repository/get',
  async ({ username, reponame }, { rejectWithValue }) => {
    try {
      const response = await repositoryService.getRepository(username, reponame);
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch repository');
    }
  },
);

export const deleteRepositoryThunk = createAsyncThunk<void, RepoParams>(
  'repository/delete',
  async ({ username, reponame }, { rejectWithValue }) => {
    try {
      await repositoryService.deleteRepository(username, reponame);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to delete repository');
    }
  },
);

export const getFilesThunk = createAsyncThunk<GitFileEntry[], GetFilesParams>(
  'repository/getfiles',
  async (
    { username, reponame, branch = 'main', path = '', recursive = false },
    { rejectWithValue },
  ) => {
    try {
      return await repositoryService.getFiles(username, reponame, branch, path, recursive);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch files');
    }
  },
);

export const getFileContentThunk = createAsyncThunk<string, GetFileContentParams>(
  'repository/getfileContent',
  async ({ username, reponame, filePath, branch = 'main' }, { rejectWithValue }) => {
    try {
      return await repositoryService.getFileContent(username, reponame, filePath, branch);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch file content');
    }
  },
);

export const getCommitsThunk = createAsyncThunk<GitCommit[], GetCommitsParams>(
  'repository/getcommits',
  async ({ username, reponame, branch = 'main', limit = 20 }, { rejectWithValue }) => {
    try {
      return await repositoryService.getCommits(username, reponame, branch, limit);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch commits');
    }
  },
);

export const getBranchesThunk = createAsyncThunk<GitBranch[], RepoParams>(
  'repository/getbranches',
  async ({ username, reponame }, { rejectWithValue }) => {
    try {
      return await repositoryService.getBranches(username, reponame);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch branches');
    }
  },
);

export const createBranchThunk = createAsyncThunk<
  { author: string },
  { username: string; reponame: string; newBranch: string; fromBranch: string },
  { state: RootState }
>(
  'repository/createBranch',
  async ({ username, reponame, newBranch, fromBranch }, { getState, rejectWithValue }) => {
    try {
      await repositoryService.createBranch(username, reponame, newBranch, fromBranch);

      const state = getState();
      const author = state.auth.user?.username || 'you';
      return { author };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to create branch');
    }
  },
);

export const deleteBranchThunk = createAsyncThunk<
  void,
  { username: string; reponame: string; branchName: string }
>('repository/deleteBranch', async ({ username, reponame, branchName }, { rejectWithValue }) => {
  try {
    await repositoryService.deleteBranch(username, reponame, branchName);
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to delete branch');
  }
});

export const createCommitThunk = createAsyncThunk<
  void,
  {
    username: string;
    reponame: string;
    branch: string;
    message: string;
    filePath: string;
    content: string;
  }
>('repository/createCommit', async (params, { rejectWithValue }) => {
  try {
    await repositoryService.createCommit(params.username, params.reponame, {
      branch: params.branch,
      message: params.message,
      filePath: params.filePath,
      content: params.content,
    });
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to create commit');
  }
});

export const updateVisibilityThunk = createAsyncThunk<
  { visibility: 'public' | 'private' },
  { username: string; reponame: string; visibility: 'public' | 'private' }
>(
  'repository/updateVisibility',
  async ({ username, reponame, visibility }, { rejectWithValue }) => {
    try {
      await repositoryService.updateVisibility(username, reponame, visibility);
      return { visibility };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to update visibility');
    }
  },
);
