import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service';
import { RegisterInput, VerifyOtpInput, LoginInput } from '../../types/user/auth.types';

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (data: RegisterInput, { rejectWithValue }) => {
    try {
      const res = await authService.register(data);
      return res;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message =
        error.response?.data?.errors?.[0].message ||
        error.response?.data?.message ||
        'Registration failed please try again.';
      return rejectWithValue(message);
    }
  },
);

export const verifyOtpThunk = createAsyncThunk(
  'auth/verifyOtp',
  async (data: VerifyOtpInput, { rejectWithValue }) => {
    try {
      const res = await authService.verifyOpt(data);
      return res;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string; errors?: { message: string }[] } };
      };
      const message =
        err.response?.data?.errors?.[0].message ||
        err.response?.data?.message ||
        'Otp Verification Failed, please try again.';
      return rejectWithValue(message);
    }
  },
);

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (data: LoginInput, { rejectWithValue }) => {
    try {
      const res = await authService.login(data);
      return res;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string; errors?: { message: string }[] } };
      };
      const message =
        err.response?.data?.errors?.[0].message ||
        err.response?.data?.message ||
        'Login Failed, please try again.';
      return rejectWithValue(message);
    }
  },
);

export const logoutThunk = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Logout failed');
  }
});

export const getMeThunk = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const response = await authService.getMe();
    return response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Session expired');
  }
});

export const forgotPasswordThunk = createAsyncThunk(
  'auth/forgotpassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email);
      return response.message;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send reset OTP');
    }
  },
);

export const verifyResetOtpThunk = createAsyncThunk(
  'auth/verifyResetOtp',
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyResetOtp(email, otp);
      return response.message;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Invalid or expired OTP');
    }
  },
);

export const resetPasswordThunk = createAsyncThunk(
  'auth/resetPassword',
  async (
    { email, otp, newPassword }: { email: string; otp: string; newPassword: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await authService.resetPassword(email, otp, newPassword);
      return response.message;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset password');
    }
  },
);

export const resendOtpThunk = createAsyncThunk(
  'auth/resendOtp',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authService.resendOtp(email);
      return response.message;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resend OTP');
    }
  },
);
