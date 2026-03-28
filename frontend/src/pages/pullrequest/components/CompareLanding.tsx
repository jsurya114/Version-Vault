import { GitCompare, GitBranch, History } from 'lucide-react';
import { GitBranch as IBranch } from '../../../types/repository/repositoryTypes';

interface CompareLandingProps {
  branches: IBranch[];
  onSelectBranch: (branchName: string) => void;
}

export const CompareLanding = ({ branches, onSelectBranch }: CompareLandingProps) => {
  // Utility to format relative time (simplified)
  const formatRelativeTime = (dateStr: string | undefined) => {
    if (!dateStr) return 'some time ago';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0)
      return `on ${new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 max-w-2xl mx-auto text-center">
      {/* Icon */}
      <div className="w-12 h-12 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mb-6 shadow-xl">
        <GitCompare className="w-6 h-6 text-gray-400" />
      </div>

      {/* Title & Description */}
      <h2 className="text-white text-3xl font-bold mb-4 tracking-tight">
        Compare and review just about anything
      </h2>
      <p className="text-gray-500 text-sm mb-10 max-w-lg leading-relaxed">
        Branches, tags, commit ranges, and time ranges. In the same repository and across forks.
      </p>

      {/* Example Comparisons Table */}
      <div className="w-full bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="px-4 py-3 border-b border-gray-800 bg-gray-900 flex items-center justify-between text-left">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
            Example comparisons
          </span>
        </div>

        <div className="divide-y divide-gray-800">
          {branches.length > 0 ? (
            branches.slice(0, 5).map((branch) => (
              <div
                key={branch.name}
                onClick={() => onSelectBranch(branch.name)}
                className="group flex items-center justify-between px-4 py-3.5 hover:bg-blue-600/5 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <GitBranch className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                  <span className="text-blue-400 text-sm font-medium group-hover:text-blue-300">
                    {branch.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 group-hover:text-gray-400">
                  <span className="text-[11px] font-medium italic">
                    {formatRelativeTime(branch.lastCommitDate)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-gray-600 text-sm italic">No recent activity found.</div>
          )}

          {/* Static example row often seen in GitHub */}
          <div className="flex items-center justify-between px-4 py-3.5 hover:bg-blue-600/5 cursor-pointer transition-all duration-200 opacity-60">
            <div className="flex items-center gap-3">
              <History className="w-4 h-4 text-gray-500" />
              <span className="text-blue-400/80 text-sm font-medium">
                main@&#123;1day&#125;...main
              </span>
            </div>
            <span className="text-[11px] font-medium italic text-gray-600">24 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};
