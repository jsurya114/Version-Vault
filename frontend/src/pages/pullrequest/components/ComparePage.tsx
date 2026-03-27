import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  GitCompare,
  CheckCircle2,
  AlertCircle,
  Users,
  FileCode,
  GitCommit as CommitIcon,
  GitBranch,
  Terminal,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from 'src/app/hooks';
import { compareCommitThunk } from '../../../features/commit/compareCommitThunk';
import { selectBranches } from '../../../features/repository/repositorySelectors';
import { GitCommit } from '../../../types/repository/repositoryTypes';
import { CompareState } from '../../../types/commit/commit.types';
import AppHeader from 'src/types/common/Layout/AppHeader';

const ComparePage = () => {
  const { username, reponame, range } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const branches = useAppSelector(selectBranches);

  const { data, isLoading } = useAppSelector((state: { commits: CompareState }) => state.commits);

  // Parse range (e.g., "main...week2")
  const [urlBase, urlHead] = range?.split('...') || ['main', ''];

  const [base, setBase] = useState(urlBase);
  const [head, setHead] = useState(urlHead);

  useEffect(() => {
    if (base && head && username && reponame) {
      dispatch(compareCommitThunk({ username, reponame, base, head }));
      if (range !== `${base}...${head}`) {
        navigate(`/${username}/${reponame}/compare/${base}...${head}`, { replace: true });
      }
    }
  }, [base, head, username, reponame, dispatch, navigate, range]);

  const groupCommitsByDate = (commits: GitCommit[]) => {
    const groups: { [key: string]: GitCommit[] } = {};
    commits.forEach((commit) => {
      const dateStr = new Date(commit.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const dateKey = `Commits on ${dateStr}`;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(commit);
    });
    return groups;
  };

  const commitGroups = data?.commits ? groupCommitsByDate(data.commits) : {};

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
      <AppHeader />

      <main className="max-w-6xl mx-auto px-6 py-10 w-full flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3 tracking-tight">Comparing changes</h1>
          <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
            Choose two branches to see what's changed or to start a new pull request. If you need
            to, you can also{' '}
            <span className="text-blue-400 cursor-pointer hover:underline">
              compare across forks
            </span>{' '}
            or{' '}
            <span className="text-blue-400 cursor-pointer hover:underline">
              learn more about diff comparisons
            </span>
            .
          </p>
        </div>

        {/* Branch Selector Bar */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex items-center gap-4 mb-8 shadow-2xl">
          <div className="flex items-center gap-4 bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-lg border-dashed">
            <div className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest border-r border-gray-700 pr-2">
                base: {base}
              </span>
              <select
                value={base}
                onChange={(e) => setBase(e.target.value)}
                className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.name} value={b.name} className="bg-gray-900">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-gray-600 font-mono text-xs">←</span>
            <div className="flex items-center gap-2 pr-2">
              <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest border-r border-gray-700 pr-2">
                compare: {head}
              </span>
              <select
                value={head}
                onChange={(e) => setHead(e.target.value)}
                className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-gray-900">
                  Choose a branch
                </option>
                {branches.map((b) => (
                  <option key={b.name} value={b.name} className="bg-gray-900">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {data && (
            <div
              className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-all ${data.isMergeable ? 'text-green-500' : 'text-red-500'}`}
            >
              {data.isMergeable ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {data.isMergeable
                  ? 'Able to merge. These branches can be automatically merged.'
                  : 'Merge conflicts detected.'}
              </span>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Target Branch Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-bold flex items-center gap-2">
                      {head} <span className="text-gray-500 font-normal">#4</span>
                    </h3>
                    <p className="text-gray-500 text-sm">No description available</p>
                  </div>
                </div>
                <button className="bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-6 py-2 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-green-900/20">
                  <GitCompare className="w-4 h-4" /> View pull request
                </button>
              </div>
            </div>

            {/* Stats Summary Bar */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 grid grid-cols-3 gap-8">
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <CommitIcon className="w-4 h-4" />
                <span className="text-sm font-bold text-white">{data.commits.length}</span>
                <span className="text-xs uppercase tracking-wider text-gray-500">commits</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-400 border-x border-gray-800">
                <FileCode className="w-4 h-4" />
                <span className="text-sm font-bold text-white">{data.filesChanged}</span>
                <span className="text-xs uppercase tracking-wider text-gray-500">
                  files changed
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <Users className="w-4 h-4" />
                <span className="text-sm font-bold text-white">{data.contributors}</span>
                <span className="text-xs uppercase tracking-wider text-gray-500">contributors</span>
              </div>
            </div>

            {/* Commit Groups */}
            <div className="space-y-12 pt-4 relative">
              {/* Vertical line connecting groups */}
              <div className="absolute left-[7px] top-6 bottom-6 w-[2px] bg-gray-800" />

              {Object.entries(commitGroups).map(([date, commits]) => (
                <div key={date} className="relative pl-8">
                  {/* Circle on the line */}
                  <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-gray-950 border-2 border-gray-800 z-10" />

                  <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
                    {date}
                  </h4>

                  <div className="space-y-4">
                    {commits.map((commit: GitCommit) => (
                      <div
                        key={commit.hash}
                        className="bg-gray-900/50 hover:bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between transition-all group"
                      >
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-bold text-blue-400 hover:underline cursor-pointer">
                            {commit.message}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <span className="text-gray-300 font-bold">{commit.author}</span>
                            authored and
                            <span className="text-gray-300 font-bold">{commit.author}</span>
                            committed 3 days ago{' '}
                            {data.isMergeable && (
                              <CheckCircle2 className="w-3 h-3 text-green-500 inline ml-1" />
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 bg-gray-950 border border-gray-800 px-3 py-1.5 rounded-lg font-mono text-xs text-gray-400 group-hover:border-blue-500/30 transition-all">
                            <FileCode className="w-3.5 h-3.5" />
                            <span className="text-xs">{commit.hash}</span>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-gray-950 border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white cursor-pointer transition-all">
                            <Terminal className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center opacity-30">
            <GitCompare className="w-12 h-12 mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest">
              Select branches to compare
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ComparePage;
