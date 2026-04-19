import { RootState } from '../../app/store';
import { createSelector } from '@reduxjs/toolkit';
const selectBase = (state: RootState) => state.notifiactions;
export const selectNotifications = createSelector([selectBase], (s) => s.notifications);
export const selectUnreadCount = createSelector([selectBase], (s) => s.unreadCount);
export const selectNotifLoading = createSelector([selectBase], (s) => s.isLoading);
export const selectNotifMeta = createSelector([selectBase], (s) => s.meta);
