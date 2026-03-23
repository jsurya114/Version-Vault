import { createAsyncThunk } from '@reduxjs/toolkit';
import { issueService } from 'src/services/issues.service';
import { IssueResponseDTO, CreateIssueDTO } from 'src/types/issues/issues.types';
import { PaginatedResponse, PaginationQuery } from 'src/types/common/Pagination/paginationTypes';
import { IssueIdParams, IssueParams, ListIssuesParams } from 'src/types/issues/issues.types';

export const createIssueThunk = createAsyncThunk<
  IssueResponseDTO,
  IssueParams & { dto: CreateIssueDTO }
>('issue/create', async ({ username, reponame, dto }, { rejectWithValue }) => {
  try {
    return await issueService.createIssue(username, reponame, dto);
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create issue');
  }
});

export const listIssuesThunk = createAsyncThunk<
  PaginatedResponse<IssueResponseDTO>,
  ListIssuesParams
>('issue/list', async ({ username, reponame, ...query }, { rejectWithValue }) => {
  try {
    return await issueService.listIssue(username, reponame, query as any);
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch issues');
  }
});

export const getIssueThunk = createAsyncThunk<IssueResponseDTO, IssueIdParams>(
  'issue/get',
  async ({ username, reponame, id }, { rejectWithValue }) => {
    try {
      return await issueService.getIssue(username, reponame, id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch issue');
    }
  },
);

export const closeIssueThunk = createAsyncThunk<IssueResponseDTO, IssueIdParams>(
  'issue/close',
  async ({ username, reponame, id }, { rejectWithValue }) => {
    try {
      return await issueService.closeIssue(username, reponame, id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to close issue');
    }
  },
);
