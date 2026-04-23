import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IActivity } from '../../types/activity/activityTypes';
import { getActivityFeedThunk } from './activityThunk';
import { initialState } from '../../types/activity/activityTypes';

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getActivityFeedThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getActivityFeedThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.page === 1) {
          state.feed = action.payload.data;
        } else {
          state.feed = [...state.feed, ...action.payload.data];
        }
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.page;
        state.total = action.payload.total;
      })
      .addCase(getActivityFeedThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default activitySlice.reducer;
