import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  notificationInitialState,
  NotificationDTO,
} from '../../types/notification/notification.types';
import {
  listNotificationsThunk,
  getUnreadCountThunk,
  markReadThunk,
  markAllReadThunk,
} from './notificationThunk';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: notificationInitialState,
  reducers: {
    addNotification: (state, action: PayloadAction<NotificationDTO>) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      //list
      .addCase(listNotificationsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(listNotificationsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(listNotificationsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // unread count
      .addCase(getUnreadCountThunk.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      //mark single read
      .addCase(markReadThunk.fulfilled, (state, action) => {
        const idx = state.notifications.findIndex((n) => n.id === action.payload.id);
        if (idx !== -1) {
          state.notifications[idx].isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      //mark all read
      .addCase(markAllReadThunk.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.isRead = true;
        });
        state.unreadCount = 0;
      });
  },
});

export const { addNotification, incrementUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;
