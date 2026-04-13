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
    <div className="relative pl-6 xs:pl-8 pb-6 xs:pb-8 last:pb-0">
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
          <h3 className="text-white text-[13px] xs:text-[15px] font-semibold">
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
              className="flex flex-col xs:flex-row items-start xs:items-center justify-between group/row pr-2 xs:pr-4 min-h-[32px] hover:bg-gray-800/10 rounded-lg transition-colors gap-1 xs:gap-0 py-1 xs:py-0"
            >
              {/* Left Column: Name + Link */}
              <div className="flex items-center gap-1.5 xs:gap-2 flex-1 min-w-0">
                {type === 'repo_created' && <Book className="w-3.5 h-3.5 text-gray-600" />}
                <span
                  onClick={() => navigate(`/${repo.repoName}`)}
                  className="text-blue-400 hover:underline cursor-pointer font-medium text-[12px] xs:text-[13.5px] truncate"
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
                <div className="flex items-center gap-1.5 w-24 xs:w-32 text-[11px] xs:text-[12px] text-gray-400 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  {repo.language}
                </div>
              )}

              {/* Right Column: Progress Bar or Date */}
              {type === 'commits' ? (
                /* 2. FIXED: Made progress bar clickable to link to commits */
                <div
                  onClick={() => navigate(`/${repo.repoName}?tab=commits`)}
                  className="w-16 xs:w-24 md:w-32 h-1.5 bg-gray-800/50 rounded-full overflow-hidden cursor-pointer hover:ring-1 hover:ring-blue-500/50 transition-all shrink-0"
                >
                  <div
                    className="h-full bg-[#3fb950] rounded-full"
                    style={{
                      width: `${Math.min((repo.commitCount / (totalCommits || 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
              ) : (
                <span className="text-gray-500 text-[10px] xs:text-[11px] w-14 xs:w-16 text-right shrink-0">{repo.date}</span>
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
    <div className="mt-8 xs:mt-12 max-w-3xl min-w-0">
      <h2 className="text-white text-base xs:text-lg font-bold mb-6 xs:mb-8">Contribution activity</h2>

      {activities.map((group, gIdx) => (
        <div key={gIdx} className="mb-12 last:mb-0">
          {/* Monthly Header */}
          <div className="flex items-center gap-3 xs:gap-4 mb-6 xs:mb-8">
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
