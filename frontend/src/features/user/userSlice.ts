import { createSlice } from '@reduxjs/toolkit';
import { getProfileThunk, updateProfileThunk } from './userThunk';
import { userService } from 'src/services/user.service';
import { initialUserState } from 'src/types/user/user.types';

const userSlice = createSlice({
  name: 'user',
  initialState: initialUserState,
  reducers: {
    clearViewedUser: (state) => {
      state.viewedUser = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      //getprofile
      .addCase(getProfileThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfileThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.viewedUser = action.payload;
      })
      .addCase(getProfileThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(updateProfileThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        // Important: If we update our own profile, sync the viewed profile too
        state.viewedUser = action.payload;
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearViewedUser } = userSlice.actions;
export default userSlice.reducer;
