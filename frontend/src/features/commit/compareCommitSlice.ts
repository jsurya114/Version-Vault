import { createSlice } from '@reduxjs/toolkit';
import { compareCommitThunk } from './compareCommitThunk';
import { initialState } from '../../types/commit/commit.types';

const compareSlice = createSlice({
  name: 'commits',
  initialState,
  reducers: {
    clearCommitComparison: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(compareCommitThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(compareCommitThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(compareCommitThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCommitComparison } = compareSlice.actions;
export default compareSlice.reducer;
