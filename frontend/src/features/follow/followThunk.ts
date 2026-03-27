import { createAsyncThunk } from '@reduxjs/toolkit';
import { followService } from '../../services/follow.service';
import { FollowDTO } from '../../types/follow/followTypes';

export const followThunk = createAsyncThunk<void, string>(
  'follow/follow',
  async (userId, { rejectWithValue }) => {
    try {
      await followService.follow(userId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to follow');
    }
  },
);
export const unfollowThunk = createAsyncThunk<void, string>(
  'follow/unfollow',
  async (userId, { rejectWithValue }) => {
    try {
      await followService.unfollow(userId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unfollow');
    }
  },
);

export const getFollowersThunk = createAsyncThunk<FollowDTO[], string>(
  'follow/getFollowers',
  async (userId, { rejectWithValue }) => {
    try {
      return await followService.getFollowers(userId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch followers');
    }
  },
);

export const getFollowingThunk = createAsyncThunk<FollowDTO[], string>(
  'follow/getFollowing',
  async (userId, { rejectWithValue }) => {
    try {
      return await followService.getFollowing(userId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch following');
    }
  },
);
