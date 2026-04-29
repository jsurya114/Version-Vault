import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, GitFork, BookOpen, Users, MoreHorizontal, ExternalLink } from 'lucide-react';
import { IActivity } from '../types/activity/activityTypes';

// Simple time formatter
const formatTimeAgo = (dateStr?: string) => {
  if (!dateStr) return '';
  const diffInMins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diffInMins < 1) return 'just now';
  if (diffInMins < 60) return `${diffInMins} min ago`;
  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 5) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
};

// Helper to get the target link
const getTargetLink = (activity: IActivity): string => {
  if (activity.actionType === 'followed_user') {
    return `/${activity.targetName}`;
  }
  return activity.targetName.includes('/')
    ? `/${activity.targetName}`
    : `/${activity.actorUsername}/${activity.targetName}`;
};

// Badge icon component — overlays on the avatar
const ActionBadge: React.FC<{ actionType: string }> = ({ actionType }) => {
  const badgeStyle =
    'absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-gray-900';

  switch (actionType) {
    case 'starred_repo':
      return (
        <div className={`${badgeStyle} bg-yellow-600`}>
          <Star className="w-2.5 h-2.5 text-white" fill="white" />
        </div>
      );
    case 'forked_repo':
      return (
        <div className={`${badgeStyle} bg-gray-600`}>
          <GitFork className="w-2.5 h-2.5 text-white" />
        </div>
      );
    case 'followed_user':
      return (
        <div className={`${badgeStyle} bg-blue-600`}>
          <Users className="w-2.5 h-2.5 text-white" />
        </div>
      );
    case 'created_repo':
      return (
        <div className={`${badgeStyle} bg-green-600`}>
          <BookOpen className="w-2.5 h-2.5 text-white" />
        </div>
      );
    default:
      return null;
  }
};

// Three-dot menu dropdown
const OptionsMenu: React.FC<{ targetLink: string }> = ({ targetLink }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1 rounded-md text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-7 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 py-1">
          <Link
            to={targetLink}
            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 transition-colors"
            onClick={() => setOpen(false)}
          >
            <ExternalLink className="w-3 h-3" /> Open
          </Link>
        </div>
      )}
    </div>
  );
};

// Nested card for repo-related activities
const RepoTargetCard: React.FC<{ activity: IActivity }> = ({ activity }) => {
  const targetLink = getTargetLink(activity);
  const displayName = activity.targetName;

  return (
    <div className="mt-3 bg-gray-950/60 border border-gray-800 rounded-lg p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <Link to={targetLink} className="flex items-center gap-2.5 min-w-0 group">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shrink-0 border border-gray-700">
            <BookOpen className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <span className="text-sm font-semibold text-blue-400 group-hover:underline truncate">
            {displayName}
          </span>
        </Link>

        {activity.actionType === 'starred_repo' && (
          <Link
            to={targetLink}
            className="flex items-center gap-1.5 px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-xs font-medium text-gray-300 hover:bg-gray-700 hover:border-gray-600 transition-colors shrink-0"
          >
            <Star className="w-3 h-3" /> Star
          </Link>
        )}

        {activity.actionType === 'forked_repo' && (
          <Link
            to={targetLink}
            className="flex items-center gap-1.5 px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-xs font-medium text-gray-300 hover:bg-gray-700 hover:border-gray-600 transition-colors shrink-0"
          >
            <GitFork className="w-3 h-3" /> View Fork
          </Link>
        )}
      </div>
    </div>
  );
};

// Nested card for followed_user activities
const UserTargetCard: React.FC<{ activity: IActivity }> = ({ activity }) => {
  const targetLink = `/${activity.targetName}`;

  return (
    <div className="mt-3 bg-gray-950/60 border border-gray-800 rounded-lg p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <Link to={targetLink} className="flex items-center gap-3 min-w-0 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 border border-gray-700">
            <span className="text-white text-xs font-bold font-mono">
              {activity.targetName?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <span className="text-sm font-semibold text-gray-200 group-hover:text-blue-400 transition-colors truncate block">
              {activity.targetName}
            </span>
          </div>
        </Link>

        <Link
          to={targetLink}
          className="flex items-center gap-1.5 px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-xs font-medium text-gray-300 hover:bg-gray-700 hover:border-gray-600 transition-colors shrink-0"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

// Main exported component
export const ActivityFeedItem: React.FC<{ activity: IActivity }> = ({ activity }) => {
  const getActionText = () => {
    switch (activity.actionType) {
      case 'starred_repo':
        return 'starred a repository';
      case 'forked_repo':
        return 'forked a repository';
      case 'followed_user':
        return 'started following';
      case 'created_repo':
        return 'created a repository';
      default:
        return 'performed an action';
    }
  };

  const targetLink = getTargetLink(activity);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors hover:border-gray-700/80">
      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-1 sm:px-5 sm:pt-5">
        <div className="flex items-start justify-between">
          {/* Left: avatar + text */}
          <div className="flex items-start gap-3">
            {/* Avatar with action badge */}
            <Link to={`/${activity.actorUsername}`} className="relative shrink-0">
              {activity.actorAvatar ? (
                <img
                  src={activity.actorAvatar}
                  alt={activity.actorUsername}
                  className="w-9 h-9 rounded-full object-cover border border-gray-700"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border border-gray-700">
                  <span className="text-white text-xs font-bold font-mono">
                    {activity.actorUsername?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <ActionBadge actionType={activity.actionType} />
            </Link>

            {/* Action text + timestamp */}
            <div className="min-w-0 pt-0.5">
              <p className="text-sm text-gray-400 leading-snug">
                <Link
                  to={`/${activity.actorUsername}`}
                  className="font-semibold text-gray-100 hover:text-blue-400 transition-colors"
                >
                  {activity.actorUsername}
                </Link>{' '}
                <span className="text-gray-500">{getActionText()}</span>
              </p>
              <p className="text-[11px] text-gray-600 mt-0.5">
                {formatTimeAgo(activity.createdAt)}
              </p>
            </div>
          </div>

          {/* Right: three-dot menu */}
          <OptionsMenu targetLink={targetLink} />
        </div>
      </div>

      {/* ── Body — target detail card ── */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        {activity.actionType === 'followed_user' ? (
          <UserTargetCard activity={activity} />
        ) : (
          <RepoTargetCard activity={activity} />
        )}
      </div>
    </div>
  );
};
