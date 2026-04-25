import React from 'react';
import { Link } from 'react-router-dom';
import { Star, GitFork, BookOpen, Users } from 'lucide-react';
import { IActivity } from '../types/activity/activityTypes';

// Simple time formatter
const formatTimeAgo = (dateStr?: string) => {
  if (!dateStr) return '';
  const diffInMins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diffInMins < 60) return `${diffInMins || 1} min ago`;
  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
};

export const ActivityFeedItem: React.FC<{ activity: IActivity }> = ({ activity }) => {
  const getActionText = () => {
    switch (activity.actionType) {
      case 'starred_repo':
        return 'starred the repository';
      case 'forked_repo':
        return 'forked the repository';
      case 'followed_user':
        return 'started following';
      case 'created_repo':
        return 'created a new repository';
      default:
        return 'did an action on';
    }
  };

  const getActionIcon = () => {
    switch (activity.actionType) {
      case 'starred_repo':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'forked_repo':
        return <GitFork className="w-4 h-4 text-gray-400" />;
      case 'followed_user':
        return <Users className="w-4 h-4 text-blue-400" />;
      case 'created_repo':
        return <BookOpen className="w-4 h-4 text-green-500" />;
      default:
        return <BookOpen className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg xs:rounded-xl p-2.5 xs:p-3 sm:p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2 xs:mb-3">
        <div className="flex items-start xs:items-center gap-3 min-w-0">
          {activity.actorAvatar ? (
            <img
              src={activity.actorAvatar}
              alt={activity.actorUsername}
              className="w-7 h-7 xs:w-8 xs:h-8 rounded-full object-cover shrink-0 border border-gray-700"
            />
          ) : (
            <div className="w-7 h-7 xs:w-8 xs:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 border border-gray-700">
              <span className="text-white text-[10px] xs:text-xs font-bold font-mono">
                {activity.actorUsername?.[0]?.toUpperCase()}
              </span>
            </div>
          )}

          <div className="min-w-0">
            <p className="text-xs xs:text-sm text-gray-400 flex flex-wrap items-center gap-1.5 xs:gap-2">
              <Link
                relative="path"
                to={`/${activity.actorUsername}`}
                className="font-semibold text-gray-200 hover:text-blue-400 cursor-pointer break-all xs:break-normal"
              >
                {activity.actorUsername}
              </Link>
              <span className="text-gray-500 text-xs">{getActionText()}</span>
              <Link
                to={
                  activity.actionType === 'followed_user'
                    ? `/${activity.targetName}`
                    : `/${activity.targetName}`
                }
                className="font-semibold text-gray-200 hover:text-blue-400 cursor-pointer break-all xs:break-normal flex items-center gap-1"
              >
                {getActionIcon()}
                {activity.targetName}
              </Link>
            </p>
            <p className="text-[10px] xs:text-[11px] text-gray-500 mt-1 hover:text-blue-400 cursor-pointer">
              {formatTimeAgo(activity.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
