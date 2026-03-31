import React from 'react';
import { GitCommit, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface RepoCommitActivity {
  repoName: string;
  commitCount: number;
  language?: string; // Add this
  date?: string; // Add this
}

export interface ActivityItemProps {
  type: 'commits' | 'repo_created';
  repoName?: string;
  totalCommits?: number;
  repoCount?: number;
  repos?: RepoCommitActivity[];
  language?: string;
  date?: string;
}
const ActivityItem: React.FC<ActivityItemProps> = ({ type, totalCommits, repoCount, repos }) => {
  const navigate = useNavigate();
  return (
    <div className="relative pl-8 pb-8 last:pb-0">
      <div className="absolute left-[11px] top-0 bottom-0 w-[1.5px] bg-gray-800/60" />

      {/* Icon Node */}
      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center z-10 shadow-sm text-gray-500">
        {type === 'commits' ? (
          <GitCommit className="w-3.5 h-3.5" />
        ) : (
          <Book className="w-3.5 h-3.5" />
        )}
      </div>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between group pr-2">
          <h3 className="text-white text-[15px] font-semibold">
            {type === 'commits'
              ? `Created ${totalCommits || 0} commits in ${repoCount || 0} repositories`
              : `Created ${repoCount || 0} ${repoCount === 1 ? 'repository' : 'repositories'}`}
          </h3>
          <div className="flex flex-col gap-[2px] opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-3 h-[1px] bg-gray-600" />
            <div className="w-3 h-[1px] bg-gray-600" />
          </div>
        </div>

        {/* Rows */}
        <div className="space-y-2">
          {repos?.map((repo, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between group/row pr-4 h-8 hover:bg-gray-800/10 rounded-lg transition-colors"
            >
              {/* Left Column: Name + Link */}
              <div className="flex items-center gap-2 flex-1">
                {type === 'repo_created' && <Book className="w-3.5 h-3.5 text-gray-600" />}
                <span
                  onClick={() => navigate(`/${repo.repoName}`)}
                  className="text-blue-400 hover:underline cursor-pointer font-medium text-[13.5px]"
                >
                  {repo.repoName}
                </span>

                {/* 1. FIXED: Added click handler to link to commits tab */}
                {type === 'commits' && (
                  <span
                    onClick={() => navigate(`/${repo.repoName}?tab=commits`)}
                    className="text-gray-400 hover:text-blue-400 cursor-pointer text-xs italic transition-colors"
                  >
                    {repo.commitCount} commits
                  </span>
                )}
              </div>

              {/* Middle Column: Language (only for repo creation) */}
              {type === 'repo_created' && (
                <div className="flex items-center gap-1.5 w-32 text-[12px] text-gray-400">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  {repo.language}
                </div>
              )}

              {/* Right Column: Progress Bar or Date */}
              {type === 'commits' ? (
                /* 2. FIXED: Made progress bar clickable to link to commits */
                <div
                  onClick={() => navigate(`/${repo.repoName}?tab=commits`)}
                  className="w-24 md:w-32 h-1.5 bg-gray-800/50 rounded-full overflow-hidden cursor-pointer hover:ring-1 hover:ring-blue-500/50 transition-all"
                >
                  <div
                    className="h-full bg-[#3fb950] rounded-full"
                    style={{
                      width: `${Math.min((repo.commitCount / (totalCommits || 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
              ) : (
                <span className="text-gray-500 text-[11px] w-16 text-right">{repo.date}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface ActivityTimelineProps {
  activities: Array<{ month: string; items: ActivityItemProps[] }>;
  isLoading?: boolean;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities, isLoading }) => {
  if (isLoading)
    return (
      <div className="animate-pulse space-y-8 mt-12 bg-gray-900/20 p-8 rounded-2xl border border-gray-800/50" />
    );

  return (
    <div className="mt-12 max-w-3xl">
      <h2 className="text-white text-lg font-bold mb-8">Contribution activity</h2>

      {activities.map((group, gIdx) => (
        <div key={gIdx} className="mb-12 last:mb-0">
          {/* Monthly Header */}
          <div className="flex items-center gap-4 mb-8">
            <span className="text-white text-sm font-bold whitespace-nowrap">
              {group.month.split(' ')[0]}{' '}
              <span className="text-gray-600 font-medium">{group.month.split(' ')[1]}</span>
            </span>
            <div className="w-full h-px bg-gray-800/60" />
          </div>

          <div className="space-y-4">
            {group.items.map((item, iIdx) => (
              <ActivityItem key={iIdx} {...item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityTimeline;
