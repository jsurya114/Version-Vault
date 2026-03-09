import { createSlice } from '@reduxjs/toolkit';
import { getAllUsersThunk } from './getUsersThunk';
import { UserResponseDTO } from 'src/types/admin/adminTypes';
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
      });
  },
});

export const { clearError } = adminUsersSlice.actions;
export default adminUsersSlice.reducer;
