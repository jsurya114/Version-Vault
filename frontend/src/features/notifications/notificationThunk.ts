import { createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../../services/notification.service';
import { NotificationDTO } from '../../types/notification/notification.types';
import { PaginatedResponse } from '../../types/common/Pagination/paginationTypes';

export const listNotificationsThunk = createAsyncThunk<
  PaginatedResponse<NotificationDTO>,
  { page?: number; limit?: number }
>('notification/list', async ({ page, limit }, { rejectWithValue }) => {
  try {
    return await notificationService.list(page, limit);
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications');
  }
});

export const getUnreadCountThunk = createAsyncThunk<number, void>(
  'notification/unreadCount',
  async (_, { rejectWithValue }) => {
    try {
      return await notificationService.getUnreadCount();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to get unread count');
    }
  },
);
export const markReadThunk = createAsyncThunk<NotificationDTO, string>(
  'notification/markRead',
  async (id, { rejectWithValue }) => {
    try {
      return await notificationService.markAsRead(id);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to mark as read');
    }
  },
);
export const markAllReadThunk = createAsyncThunk<void, void>(
  'notification/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllRead();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to mark all as read');
    }
  },
);
