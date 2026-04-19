import { useEffect, useState, useRef } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  listNotificationsThunk,
  getUnreadCountThunk,
  markReadThunk,
  markAllReadThunk,
} from '../../../features/notifications/notificationThunk';
import {
  selectNotifications,
  selectUnreadCount,
} from '../../../features/notifications/notificationSelector';
import { useNotificationSocket } from '../../../hooks/useNotificationSocket';
import { NotificationDTO } from '../../../types/notification/notification.types';
import { useNavigate } from 'react-router-dom';
import React from 'react';

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const NotificationDropdown = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Connect socket listener
  useNotificationSocket();

  // Fetch on mount
  useEffect(() => {
    dispatch(getUnreadCountThunk());
    dispatch(listNotificationsThunk({ page: 1, limit: 20 }));
  }, [dispatch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNotificationClick = (notification: NotificationDTO) => {
    if (!notification.isRead) {
      dispatch(markReadThunk(notification.id));
    }

    // Navigate based on type
    if (notification.type === 'followed' || notification.type === 'unfollowed') {
      navigate(`/profile/${notification.actorUsername}`);
    } else if (notification.repositoryName && notification.metadata?.prId) {
      navigate(
        `/${notification.actorUsername}/${notification.repositoryName}/pulls/${notification.metadata.prId}`,
      );
    } else if (notification.repositoryName) {
      navigate(`/${notification.actorUsername}/${notification.repositoryName}`);
    }
    setIsOpen(false);
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  const renderNotification = (n: NotificationDTO) => (
    <button
      key={n.id}
      onClick={() => handleNotificationClick(n)}
      className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-800/50 transition-colors border-b border-gray-800/50 ${
        !n.isRead ? 'bg-blue-500/5' : ''
      }`}
    >
      {/* Unread dot */}
      <div className="mt-1.5 shrink-0">
        {!n.isRead ? (
          <div className="w-2 h-2 rounded-full bg-blue-500" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-transparent" />
        )}
      </div>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
        {n.actorUsername[0]?.toUpperCase()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-gray-300 text-sm leading-snug">
          <span className="font-bold text-white">{n.actorUsername}</span>{' '}
          {n.message.replace(n.actorUsername, '').trim()}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-gray-600 text-[11px]">{timeAgo(n.createdAt)}</span>
          {n.repositoryName && (
            <span className="text-gray-600 text-[11px] font-mono truncate">{n.repositoryName}</span>
          )}
        </div>
      </div>

      {/* Read indicator */}
      {n.isRead && <Check className="w-3 h-3 text-gray-700 mt-1 shrink-0" />}
    </button>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-11 w-80 sm:w-96 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <h3 className="text-white text-sm font-bold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => dispatch(markAllReadThunk())}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {unreadNotifications.length > 0 && (
                  <div className="flex flex-col">
                    <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 sticky top-0 z-10 text-[10px] font-bold text-gray-400 uppercase tracking-wider shadow-sm">
                      New
                    </div>
                    {unreadNotifications.map(renderNotification)}
                  </div>
                )}

                {readNotifications.length > 0 && (
                  <div className="flex flex-col">
                    <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 sticky top-0 z-10 text-[10px] font-bold text-gray-400 uppercase tracking-wider shadow-sm">
                      Earlier
                    </div>
                    {readNotifications.map(renderNotification)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
