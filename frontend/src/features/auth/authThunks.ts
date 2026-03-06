import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from 'src/services/auth.service';
import { RegisterInput } from 'src/types/auth.types';

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
