import { AuthState } from '../../types/user/auth.types';
import { updateProfileThunk } from '../user/userThunk';
import { createSlice } from '@reduxjs/toolkit';
import {
  registerThunk,
  verifyOtpThunk,
  loginThunk,
  logoutThunk,
  getMeThunk,
  forgotPasswordThunk,
  resetPasswordThunk,
  resendOtpThunk,
} from './authThunks';

const initialState: AuthState = {
  isLoading: false,
  error: null,
  successMessage: null,
  registeredEmail: null,
  user: null,
  isAuthenticated: false,
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
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
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

    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    //logout
    builder
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.accessToken = undefined;
        state.isAuthenticated = false;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    builder
      .addCase(getMeThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMeThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(getMeThunk.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      .addCase(forgotPasswordThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(forgotPasswordThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload;
      })
      .addCase(forgotPasswordThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // reset password
      .addCase(resetPasswordThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(resetPasswordThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload;
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // resend otp
      .addCase(resendOtpThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(resendOtpThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload;
      })
      .addCase(resendOtpThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(updateProfileThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSuccessMessage, setRegisteredEmail, logout } = authSlice.actions;
export default authSlice.reducer;
