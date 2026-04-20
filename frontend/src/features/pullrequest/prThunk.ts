import { createAsyncThunk } from '@reduxjs/toolkit';
import { prService } from '../../services/pullrequest.service';
import {
  PRResponseDTO,
  CreatePRDTO,
  PRParams,
  PRIdParams,
  ConflictDetails,
  ResolvedFile,
} from '../../types/pullrequest/pullrequest.types';
import { PaginatedResponse } from '../../types/common/Pagination/paginationTypes';
import { ListPRsParams } from '../../types/pullrequest/pullrequest.types';

export const createPRThunk = createAsyncThunk<PRResponseDTO, PRParams & { dto: CreatePRDTO }>(
  'pr/create',
  async ({ username, reponame, dto }, { rejectWithValue }) => {
    try {
      return await prService.createPR(username, reponame, dto);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to create PR');
    }
  },
);

export const listPRThunk = createAsyncThunk<PaginatedResponse<PRResponseDTO>, ListPRsParams>(
  'pr/list',
  async ({ username, reponame, ...query }, { rejectWithValue }) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await prService.listPR(username, reponame, query as any);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch PRs');
    }
  },
);

export const getPRThunk = createAsyncThunk<PRResponseDTO, PRIdParams>(
  'pr/get',
  async ({ username, reponame, id }, { rejectWithValue }) => {
    try {
      return await prService.getPR(username, reponame, id);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch PR');
    }
  },
);

export const mergePRThunk = createAsyncThunk<PRResponseDTO, PRIdParams>(
  'pr/merge',
  async ({ username, reponame, id }, { rejectWithValue }) => {
    try {
      return await prService.mergePR(username, reponame, id);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to merge PR');
    }
  },
);

export const closePRThunk = createAsyncThunk<PRResponseDTO, PRIdParams>(
  'pr/close',
  async ({ username, reponame, id }, { rejectWithValue }) => {
    try {
      return await prService.closePR(username, reponame, id);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to close PR');
    }
  },
);

export const requestMergeThunk = createAsyncThunk<PRResponseDTO, PRIdParams>(
  'pr/requestMerge',
  async ({ username, reponame, id }, { rejectWithValue }) => {
    try {
      return await prService.requestMerge(username, reponame, id);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to request merge');
    }
  },
);

export const approveMergeThunk = createAsyncThunk<PRResponseDTO, PRIdParams>(
  'pr/approvMerge',
  async ({ username, reponame, id }, { rejectWithValue }) => {
    try {
      return await prService.approveMerge(username, reponame, id);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to request merge');
    }
  },
);

export const rejectMergeThunk = createAsyncThunk<PRResponseDTO, PRIdParams>(
  'pr/rejectMerge',
  async ({ username, reponame, id }, { rejectWithValue }) => {
    try {
      return await prService.rejectMerge(username, reponame, id);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to request merge');
    }
  },
);

export const getConflictsThunk = createAsyncThunk<ConflictDetails, PRIdParams>(
  'pr/getConflicts',
  async ({ username, reponame, id }, { rejectWithValue }) => {
    try {
      return await prService.getConflicts(username, reponame, id);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to get conflict details');
    }
  },
);

export const resolveConflictsThunk = createAsyncThunk<
  PRResponseDTO,
  PRIdParams & { resolvedFiles: ResolvedFile[] }
>('pr/resolveConflicts', async ({ username, reponame, id, resolvedFiles }, { rejectWithValue }) => {
  try {
    return await prService.resolveConflicts(username, reponame, id, resolvedFiles);
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to resolve conflicts');
  }
});
