import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  GitCompare,
  CheckCircle2,
  Users,
  FileCode,
  GitCommit as CommitIcon,
  MoreHorizontal,
  Code,
  XCircle,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { compareCommitThunk } from '../../features/commit/compareCommitThunk';
import { getBranchesThunk } from 'src/features/repository/repositoryThunks';
import { GitCommit } from '../../types/repository/repositoryTypes';
import { selectBranches } from '../../features/repository/repositorySelectors';
import {
  selectCompareData,
  selectCompareLoading,
} from 'src/features/commit/compareCommitSelectors';
import AppHeader from '../../types/common/Layout/AppHeader';

const CompareCommitPage = () => {
  const { username, reponame, base: urlBase, head: urlHead } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Data from state
  const branches = useAppSelector(selectBranches);
  const data = useAppSelector(selectCompareData);
  const isLoading = useAppSelector(selectCompareLoading);

  // Parse branches from the "base...head" URL format if available
  const initialBase = urlBase || 'main';
  const initialHead = urlHead || '';

  const [base, setBase] = useState(initialBase);
  const [head, setHead] = useState(initialHead);

  // Fetch branches if missing
  useEffect(() => {
    if (username && reponame && branches.length === 0) {
      dispatch(getBranchesThunk({ username, reponame }));
    }
  }, [username, reponame, branches.length, dispatch]);

  useEffect(() => {
    if (branches.length > 0) {
      if (!base && urlBase) setBase(urlBase);
      else if (!base && branches.length > 0) setBase(branches[0].name);

      if (!head && urlHead) setHead(urlHead);
    }
  }, [branches, urlBase, urlHead]);

  // Re-fetch whenever branches change
  useEffect(() => {
    if (base && head && username && reponame) {
      dispatch(compareCommitThunk({ username, reponame, base, head }));
      // Update URL to match current selection
      navigate(`/${username}/${reponame}/compare/${base}...${head}`, { replace: true });
    }
  }, [base, head, username, reponame, dispatch, navigate]);

  const groupCommitsByDate = (commits: GitCommit[]) => {
    const groups: { [key: string]: GitCommit[] } = {};
    commits?.forEach((commit) => {
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
    <div className="min-h-screen bg-gray-950 text-gray-300 flex flex-col font-sans selection:bg-blue-500/30">
      <AppHeader />

      <main className="max-w-6xl mx-auto px-6 py-8 w-full flex-1">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 tracking-tight text-white leading-tight">
            Comparing changes
          </h1>
          <p className="text-gray-400 text-[14px]">
            Choose two branches to see what's changed or to start a new pull request. If you need
            to, you can also{' '}
            <span className="text-blue-400 hover:underline cursor-pointer transition-colors duration-200">
              compare across forks
            </span>{' '}
            or{' '}
            <span className="text-blue-400 hover:underline cursor-pointer transition-colors duration-200">
              learn more about diff comparisons
            </span>
            .
          </p>
        </div>

        {/* Branch Selector Bar */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex items-center gap-4 mb-6 shadow-sm">
          <div className="bg-gray-800 border border-gray-700/50 rounded-md p-1.5 flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-gray-500 ml-1.5" />
            <div className="flex items-center gap-1.5 px-2">
              <span className="text-gray-500 text-[11px] font-bold uppercase tracking-tight">
                base:
              </span>
              <select
                value={base}
                onChange={(e) => setBase(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-white focus:outline-none cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.name} value={b.name} className="bg-gray-900">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-gray-700 font-mono text-sm leading-none select-none">←</span>
            <div className="flex items-center gap-1.5 px-2 border-r border-gray-700 mr-1">
              <span className="text-gray-500 text-[11px] font-bold uppercase tracking-tight">
                compare:
              </span>
              <select
                value={head}
                onChange={(e) => setHead(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-blue-400 focus:outline-none cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.name} value={b.name} className="bg-gray-900">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <MoreHorizontal className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white transition-colors" />
          </div>

          <div className="flex items-center gap-2">
            {!isLoading &&
              data &&
              (data.isMergeable ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-green-500 text-[13px] font-bold">Able to merge.</span>
                  <span className="text-gray-500 text-[13px]">
                    These branches can be automatically merged.
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-500 text-[13px] font-bold">
                    Can't automatically merge.
                  </span>
                  <span className="text-gray-500 text-[13px]">
                    Don't worry, you can still create the pull request.
                  </span>
                </>
              ))}
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-md p-5 flex items-center justify-between mb-8 shadow-sm">
          <div className="text-[14px]">
            Discuss and review the changes in this comparison with others.{' '}
            <span className="text-blue-400 hover:underline cursor-pointer">
              Learn about pull requests
            </span>
          </div>
          <button className="bg-[#238636] hover:bg-[#2ea043] text-white text-[14px] font-bold px-5 py-1.5 rounded-md transition-all shadow-md focus:ring-2 focus:ring-green-500/50">
            Create pull request
          </button>
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4 opacity-70">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-widest font-black text-gray-600">
              Loading differences
            </p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Stats Summary Bar */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-md py-3 px-6 flex items-center justify-around">
              <div className="flex items-center gap-2 text-gray-500">
                <CommitIcon className="w-3.5 h-3.5" />
                <span className="text-[12px]">
                  <span className="font-black text-white">{data.commits.length}</span> commits
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 border-x border-gray-800 px-16">
                <FileCode className="w-3.5 h-3.5" />
                <span className="text-[12px]">
                  <span className="font-black text-white">{data.filesChanged}</span> files changed
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Users className="w-3.5 h-3.5" />
                <span className="text-[12px]">
                  <span className="font-black text-white">{data.contributors}</span>{' '}
                  {data.contributors === 1 ? 'contributor' : 'contributors'}
                </span>
              </div>
            </div>

            {/* Commit History */}
            <div className="space-y-8 pt-4">
              {Object.entries(commitGroups).map(([date, commits]) => (
                <div key={date} className="relative">
                  <div className="flex items-center gap-3 mb-4 text-gray-500">
                    <div className="w-3.5 h-3.5 font-black flex items-center justify-center opacity-40">
                      -o-
                    </div>
                    <span className="text-[13px] font-bold text-gray-400 tracking-tight">
                      {date}
                    </span>
                  </div>
                  <div className="bg-gray-950 border border-gray-800 rounded-md divide-y divide-gray-800">
                    {commits.map((commit: GitCommit) => (
                      <div
                        key={commit.hash}
                        className="p-4 flex flex-col gap-1 hover:bg-gray-900/40 transition-all cursor-pointer group/card"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-white text-[14px] font-bold group-hover/card:text-blue-400 transition-colors">
                              {commit.message}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 opacity-80">
                            <div className="flex items-center bg-gray-800 border border-gray-700/50 rounded px-2 py-0.5 gap-1.5 text-gray-400 hover:text-white transition-colors">
                              <FileCode className="w-3 h-3" />
                              <span className="text-[11px] font-mono font-bold tracking-tight">
                                {commit.hash.substring(0, 7)}
                              </span>
                            </div>
                            <div className="p-1 px-1.5 bg-gray-800 border border-gray-700/50 rounded text-gray-400 hover:text-white transition-colors">
                              <Code className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[12px] text-gray-500 mt-1">
                          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-gray-800 flex items-center justify-center text-[8px] font-bold text-blue-300">
                            {commit.author[0]?.toUpperCase()}
                          </div>
                          <span className="text-gray-300 font-bold hover:underline cursor-pointer">
                            {commit.author}
                          </span>
                          committed recently{' '}
                          {data.isMergeable && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 inline ml-0.5" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Info Status */}
            <div className="pt-8 border-t border-gray-800 flex items-center justify-between opacity-70">
              <div className="flex items-center gap-2 text-gray-500 text-[13px]">
                <FileCode className="w-4 h-4" />
                <span>
                  Showing{' '}
                  <span className="text-blue-400 font-bold">{data.filesChanged} changed files</span>{' '}
                  with <span className="font-black text-white">323 additions</span> and{' '}
                  <span className="font-black text-white">311 deletions</span>.
                </span>
              </div>
              <div className="flex bg-gray-900 border border-gray-800 rounded-md overflow-hidden text-[12px]">
                <button className="px-3 py-1 font-bold text-white border-r border-gray-800 hover:bg-gray-800 transition-colors">
                  Split
                </button>
                <button className="px-3 py-1 font-bold text-white bg-gray-800 transition-colors shadow-inner">
                  Unified
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default CompareCommitPage;
