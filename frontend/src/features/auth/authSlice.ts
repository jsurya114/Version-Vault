import { AuthState } from 'src/types/auth.types';
import { createSlice } from '@reduxjs/toolkit';
import { registerThunk, verifyOtpThunk } from './authThunks';

const initialState: AuthState = {
  isLoading: false,
  error: null,
  successMessage: null,
  registeredEmail: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setRegisteredEmail: (state, action) => {
      state.registeredEmail = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      //registration
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    //verifyOtp

    builder
      .addCase(verifyOtpThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtpThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(verifyOtpThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSuccessMessage, setRegisteredEmail } = authSlice.actions;
export default authSlice.reducer;
