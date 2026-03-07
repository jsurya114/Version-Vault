import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from 'src/services/auth.service';
import { RegisterInput, VerifyOtpInput,LoginInput } from 'src/types/auth.types';

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (data: RegisterInput, { rejectWithValue }) => {
    try {
      const res = await authService.register(data);
      return res;
    } catch (error: any) {
      const message =
        error.res?.data?.message ||
        error.resonse?.data?.errors?.[0].message ||
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
        err.response?.data?.message ||
        err.response?.data?.errors?.[0].message ||
        'Otp Verification Failed, please try again.';
      return rejectWithValue(message);
    }
  },

);

 export const loginThunk=createAsyncThunk(
    'auth/login',
    async (data:LoginInput,{rejectWithValue})=>{
      try {
        const res = await authService.login(data)
        return res
      } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string; errors?: { message: string }[] } };
      };
      const message =err.response?.data?.message ||err.response?.data?.errors?.[0].message ||'Login Failed, please try again.';
      return rejectWithValue(message);
    }
  },
    
  )
