import { createAsyncThunk } from '@reduxjs/toolkit';
import { prService } from 'src/services/pullrequest.service';
import {
  PRResponseDTO,
  CreatePRDTO,
  PRParams,
  PRIdParams,
} from 'src/types/pullrequest/pullrequest.types';
import { PaginationQuery, PaginatedResponse } from 'src/types/common/Pagination/paginationTypes';
import { ListPRsParams } from 'src/types/pullrequest/pullrequest.types';

export const createPRThunk = createAsyncThunk<PRResponseDTO, PRParams & { dto: CreatePRDTO }>(
  'pr/create',
  async ({ username, reponame, dto }, { rejectWithValue }) => {
    try {
      return await prService.createPR(username, reponame, dto);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create PR');
    }
  },
);

export const listPRThunk = createAsyncThunk<PaginatedResponse<PRResponseDTO>, ListPRsParams>(
  'pr/list',
  async ({ username, reponame, ...query }, { rejectWithValue }) => {
    try {
      return await prService.listPR(username, reponame, query as any);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch PRs');
    }
  },
);

export const getPRThunk = createAsyncThunk<PRResponseDTO, PRIdParams>(
  'pr/get',
  async ({ username, reponame, id }, { rejectWithValue }) => {
    try {
      return await prService.getPR(username, reponame, id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch PR');
    }
  },
);

export const mergePRThunk = createAsyncThunk<PRResponseDTO, PRIdParams>(
  'pr/merge',
  async ({ username, reponame, id }, { rejectWithValue }) => {
    try {
      return await prService.mergePR(username, reponame, id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to merge PR');
    }
  },
);

export const closePRThunk = createAsyncThunk<PRResponseDTO, PRIdParams>(
  'pr/close',
  async ({ username, reponame, id }, { rejectWithValue }) => {
    try {
      return await prService.closePR(username, reponame, id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to close PR');
    }
  },
);
