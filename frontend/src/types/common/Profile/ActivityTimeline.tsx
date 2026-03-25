import React from 'react';
import { GitCommit, GitPullRequest, CircleDot } from 'lucide-react';

export interface ActivityItemProps {
  type: 'push' | 'pr' | 'issue';
  repo: string;
  branch?: string;
  count?: number;
  time: string;
  title?: string;
  id?: string;
  commits?: Array<{ hash: string; message: string }>;
  status?: 'merged' | 'closed' | 'open';
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  type,
  repo,
  branch,
  count,
  time,
  title,
  id,
  commits,
  status: _status, // Rename to avoid unused warning if it's in the interface but not used here
}) => {
  const getBorderColor = () => {
    switch (type) {
      case 'push':
        return 'border-blue-500/30';
      case 'pr':
        return 'border-green-500/30';
      case 'issue':
        return 'border-purple-500/30';
      default:
        return 'border-gray-800';
    }
  };

  return (
    <div className="relative pl-10 pb-8 last:pb-0">
      {/* Timeline Line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-800/50" />

      {/* Icon Node */}
      <div
        className={`absolute left-[7px] top-1 w-[18px] h-[18px] rounded-full bg-gray-950 border-2 ${getBorderColor()} flex items-center justify-center z-10 animate-in fade-in zoom-in duration-500`}
      >
        <div
          className={`w-2 h-2 rounded-full ${type === 'push' ? 'bg-blue-400' : type === 'pr' ? 'bg-green-400' : 'bg-purple-400'}`}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap text-sm">
          <span className="text-gray-300">
            {type === 'push' ? (
              <>
                Pushed {count} {count === 1 ? 'commit' : 'commits'} to{' '}
                <code className="text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded text-xs mx-0.5">
                  {branch}
                </code>{' '}
                in{' '}
              </>
            ) : type === 'pr' ? (
              <>Opened a pull request in </>
            ) : (
              <>Closed an issue in </>
            )}
            <span className="text-white font-bold hover:underline cursor-pointer">{repo}</span>
          </span>
          <span className="text-gray-500 text-xs">{time}</span>
        </div>

        {/* Inner Content Box */}
        {(commits || title) && (
          <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-4 mt-1 hover:border-gray-700 transition-colors duration-200">
            {type === 'push' && commits && (
              <div className="space-y-3">
                {commits.map((commit, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-4 font-mono text-xs"
                  >
                    <span className="text-blue-400 hover:underline cursor-pointer flex-shrink-0">
                      {commit.hash}
                    </span>
                    <span className="text-gray-400 truncate flex-1 text-right">
                      {commit.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {type === 'pr' && title && (
              <div className="flex items-center gap-3">
                <span className="text-gray-300 font-medium text-sm">
                  #{id} {title}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface ActivityTimelineProps {
  activities: Array<{
    date: string;
    items: ActivityItemProps[];
  }>;
  totalContributions: number;
  isLoading?: boolean;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  totalContributions,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="mt-12 animate-pulse">
        <div className="h-8 w-48 bg-gray-800 rounded mb-4" />
        <div className="h-4 w-64 bg-gray-800 rounded mb-8" />
        <div className="space-y-8">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-6 w-32 bg-gray-800 rounded" />
              <div className="h-20 w-full bg-gray-800/50 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  const totalItems = activities?.reduce((sum, group) => sum + (group.items?.length || 0), 0) || 0;

  return (
    <div className="mt-12">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-white text-xl font-bold flex items-center gap-3">
          Contribution Activity
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {totalContributions} contributions in the last year
        </p>
      </div>

      <div className="flex gap-8">
        {/* Timeline */}
        <div className="flex-1">
          {!activities || activities.length === 0 ? (
            <div className="py-12 text-center bg-gray-900/20 border border-dashed border-gray-800 rounded-2xl">
              <p className="text-gray-500 text-sm">No recent activity found</p>
            </div>
          ) : (
            activities.map((group, gIdx) => (
              <div key={gIdx} className="mb-10 last:mb-0">
                <div className="bg-gray-900/50 border border-gray-800/50 px-3 py-1.5 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-wider w-fit mb-6">
                  {group.date}
                </div>
                <div className="space-y-4">
                  {group.items?.map((item, iIdx) => (
                    <ActivityItem key={iIdx} {...item} />
                  ))}
                </div>
              </div>
            ))
          )}

          {totalItems > 5 && (
            <button className="w-full py-3 mt-6 text-sm text-blue-400 hover:text-blue-300 hover:bg-gray-900/30 border border-gray-800/50 rounded-xl transition-all duration-200">
              Show more activity
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityTimeline;
