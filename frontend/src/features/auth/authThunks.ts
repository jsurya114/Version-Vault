import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from 'src/services/auth.service';
import { RegisterInput, VerifyOtpInput, LoginInput } from 'src/types/auth.types';

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (data: RegisterInput, { rejectWithValue }) => {
    try {
      const res = await authService.register(data);
      return res;
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
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Logout failed');
  }
});
