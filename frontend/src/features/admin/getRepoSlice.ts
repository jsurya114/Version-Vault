import { createSlice } from '@reduxjs/toolkit';
import { initialRepoState } from '../../types/admin/getRepoTypes';
import { getAllRepoThunk, getRepoThunk, unblockRepoThunk, blockRepoThunk } from './getRepoThunk';

const adminReposSlice = createSlice({
  name: 'adminRepos',
  initialState: initialRepoState,
  reducers: {
    clearRepoError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // List all repos
      .addCase(getAllRepoThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllRepoThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.repos = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(getAllRepoThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      //getby id

      .addCase(getRepoThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRepoThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedRepo = action.payload;
      })
      .addCase(getRepoThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Block repository
      .addCase(blockRepoThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedRepo = action.payload;
        const index = state.repos.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.repos[index] = action.payload;
        }
      })
      // Unblock repository
      .addCase(unblockRepoThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedRepo = action.payload;
        const index = state.repos.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.repos[index] = action.payload;
        }
      });
  },
});
export const { clearRepoError } = adminReposSlice.actions;
export default adminReposSlice.reducer;
