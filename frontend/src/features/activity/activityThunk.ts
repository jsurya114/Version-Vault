import { createAsyncThunk } from '@reduxjs/toolkit';
import { activityService } from 'src/services/activity.service';
import {
  PaginatedActivityResponse,
} from '../../types/activity/activityTypes';

export const getActivityFeedThunk = createAsyncThunk<
  PaginatedActivityResponse,
  { page: number; sort: string }
>('activity/getFeed', async ({ page, sort }, { rejectWithValue }) => {
  try {
    const response = await activityService.getFeed(page, sort);
    return response;
  } catch (error: unknown) {
    // Standard error catching for typed pipelines
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch activity feed');
  }
});
