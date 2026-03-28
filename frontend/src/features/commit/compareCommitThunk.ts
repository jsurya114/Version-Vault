import { createAsyncThunk } from '@reduxjs/toolkit';
import { commitService } from 'src/services/commit.service';

export const compareCommitThunk = createAsyncThunk(
  'compare/fetch',
  async (
    {
      username,
      reponame,
      base,
      head,
    }: { username: string; reponame: string; base: string; head: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await commitService.compareCommit(username, reponame, base, head);
      return response;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch comparison');
    }
  },
);
