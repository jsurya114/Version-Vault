import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitPullRequest, Clock, X, AlertCircle } from 'lucide-react';

interface ActiveBranch {
  name: string;
  lastCommitDate?: string;
  lastCommitAuthor?: string;
  lastCommitMessage?: string;
  isRejected?: boolean;
}

interface RecentPushesBannerProps {
  username: string;
  reponame: string;
  branches: ActiveBranch[];
  defaultBranch?: string;
}

export const RecentPushesBanner: React.FC<RecentPushesBannerProps> = ({
  username,
  reponame,
  branches,
  defaultBranch = 'main',
}) => {
  const navigate = useNavigate();
  if (branches.length === 0) return null;

  const branch = branches[0]; // Show the most recent one
  const isRejected = branch.isRejected;

  const storageKey = `dismissed_banner_${username}_${reponame}_${branch.name}`;
  const [isVisible, setIsVisible] = useState(() => !localStorage.getItem(storageKey));

  if (!isVisible || branches.length === 0) return null;

  const handleDismiss = () => {
    localStorage.setItem(storageKey, 'true');
    setIsVisible(false);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${mins} min${mins > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500 relative group">
      <div
        className={`
        bg-gradient-to-r 
        ${
          isRejected
            ? 'from-red-900/20 to-orange-900/20 border-red-500/30'
            : 'from-blue-900/20 to-indigo-900/20 border-blue-500/30'
        } 
        border rounded-xl p-4 flex items-center justify-between shadow-lg backdrop-blur-sm
      `}
      >
        <div className="flex items-center gap-4">
          <div
            className={`
            w-10 h-10 
            ${isRejected ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'} 
            rounded-full flex items-center justify-center
          `}
          >
            {isRejected ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <GitPullRequest className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-white text-sm font-bold flex items-center gap-2">
              <span
                className={`
                ${isRejected ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'} 
                px-2 py-0.5 rounded font-mono text-xs italic
              `}
              >
                {branch.name}
              </span>
              {isRejected ? (
                <span className="text-red-300">was rejected by the owner</span>
              ) : (
                <>
                  had recent pushes by{' '}
                  <span className="text-blue-300">{branch.lastCommitAuthor}</span>
                </>
              )}
            </p>
            <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              pushed {timeAgo(branch.lastCommitDate || '')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isRejected ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-black shadow-inner">
              <X className="w-4 h-4" />
              Rejected
            </div>
          ) : (
            <button
              onClick={() =>
                navigate(
                  `/${username}/${reponame}/pulls/new/form?base=${defaultBranch}&head=${branch.name}&title=${encodeURIComponent(branch.lastCommitMessage || '')}`,
                )
              }
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-4 py-2 rounded-lg transition-all shadow-md flex items-center gap-2 whitespace-nowrap active:scale-95"
            >
              Compare & pull request
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-white transition-colors p-1"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
