import { createSlice } from '@reduxjs/toolkit';
import { followInitialState } from '../../types/follow/followTypes';
import { followThunk, unfollowThunk, getFollowersThunk, getFollowingThunk } from './followThunk';

const followSlice = createSlice({
  name: 'follow',
  initialState: followInitialState,
  reducers: {
    clearFollowError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(followThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(followThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(followThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(unfollowThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(unfollowThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(unfollowThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(getFollowersThunk.fulfilled, (state, action) => {
        state.followers = action.payload;
      })
      .addCase(getFollowingThunk.fulfilled, (state, action) => {
        state.following = action.payload;
      });
  },
});

export const { clearFollowError } = followSlice.actions;
export default followSlice.reducer;
