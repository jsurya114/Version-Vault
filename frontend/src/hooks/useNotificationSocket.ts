import { useEffect } from 'react';
import { useAppDispatch } from '../app/hooks';
import { socketService } from '../services/socketService';
import { addNotification } from '../features/notifications/notificationSlice';
import { NotificationDTO } from '../types/notification/notification.types';

export const useNotificationSocket = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handler = (data: NotificationDTO) => {
      dispatch(addNotification(data));
    };

    socket.on('notification', handler);
    return () => {
      socket.off('notification', handler);
    };
  }, [dispatch]);
};
