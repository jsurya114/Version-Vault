import { createSlice, Tuple } from '@reduxjs/toolkit';
import {
  blockUserThunk,
  getAllUsersThunk,
  getUserByIdThunk,
  unBlockUserThunk,
} from './getUsersThunk';

import { AdminState, initialState } from 'src/types/admin/getusers.types';

const adminUsersSlice = createSlice({
  name: 'adminusers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllUsersThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllUsersThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(getAllUsersThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      //get single user
      .addCase(getUserByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload;
      })
      .addCase(getUserByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      //block usr
      .addCase(blockUserThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload;

        // update in users list too
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) state.users[index] = action.payload;
      })
      //
      .addCase(unBlockUserThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload;
        // update in users list too
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) state.users[index] = action.payload;
      });
  },
});

export const { clearError } = adminUsersSlice.actions;
export default adminUsersSlice.reducer;
