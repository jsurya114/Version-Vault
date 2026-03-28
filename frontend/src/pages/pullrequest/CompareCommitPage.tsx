import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Users,
  FileCode,
  GitCommit as CommitIcon,
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

import { GitPullRequest } from 'lucide-react';

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

  const handleCreatePR = () => {
    navigate(`/${username}/${reponame}/pulls/new/form?base=${base}&head=${head}`);
  };

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
        {/* Main Compare Card */}
        <div className="bg-[#0d1117] border border-gray-800 rounded-xl p-8 flex items-start justify-between mb-8 shadow-sm w-full">
          <div className="flex flex-col max-w-[50%]">
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center mb-5 shadow-sm">
              <GitPullRequest className="w-5 h-5 text-blue-500" />
            </div>
            <h1 className="text-[28px] font-bold mb-3 text-white tracking-tight leading-none">
              Compare changes
            </h1>
            <p className="text-[#8b949e] text-[14px] leading-relaxed">
              Choose two branches to see what's changed or to start a new pull request.
            </p>
          </div>

          <div className="flex flex-col items-end gap-3 mt-1">
            <div className="bg-[#010409] border border-gray-800 rounded-lg p-2.5 px-3 flex items-center justify-center gap-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest ml-1">
                  BASE
                </span>
                <div className="relative">
                  <select
                    value={base || ''}
                    onChange={(e) => setBase(e.target.value)}
                    className="appearance-none bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] text-[13px] font-semibold py-1.5 pl-3 pr-8 rounded-md border border-gray-700/60 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    {branches.map((b) => (
                      <option key={b.name} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg
                      className="fill-current h-3.5 w-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>

              <span className="text-gray-600 font-mono text-sm leading-none select-none">←</span>

              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest ml-1">
                  COMPARE
                </span>
                <div className="relative">
                  <select
                    value={head || ''}
                    onChange={(e) => setHead(e.target.value)}
                    className={`appearance-none hover:bg-[#30363d] text-[13px] font-semibold py-1.5 pl-3 pr-8 rounded-md border border-gray-700/60 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer ${
                      !head
                        ? 'bg-[#1f242c] text-blue-400 border-none'
                        : 'bg-[#21262d] text-[#e6edf3]'
                    }`}
                  >
                    <option value="" disabled className="text-gray-500">
                      Select branch
                    </option>
                    {branches.map((b) => (
                      <option key={b.name} value={b.name} className="text-[#e6edf3]">
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <div
                    className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${!head ? 'text-blue-500' : 'text-gray-400'}`}
                  >
                    <svg
                      className="fill-current h-3.5 w-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Actions below selectors */}
            <div className="flex flex-col items-end gap-3 w-full">
              {!isLoading && data && head && (
                <div className="flex items-center justify-between w-full mt-2 space-x-4">
                  <div className="flex items-center gap-2 pl-2">
                    {data.isMergeable ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#3fb950]" />
                        <span className="text-[#3fb950] text-[13px] font-medium">
                          Able to merge.
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-[#f85149]" />
                        <span className="text-[#f85149] text-[13px] font-medium">
                          Can't automatically merge.
                        </span>
                      </>
                    )}
                  </div>

                  {head !== base && (
                    <button
                      onClick={handleCreatePR}
                      className="bg-[#238636] hover:bg-[#2ea043] border border-[rgba(240,246,252,0.1)] text-white text-[13px] font-semibold px-4 py-1.5 rounded-md transition-all shadow-sm flex items-center gap-2"
                    >
                      <GitPullRequest className="w-4 h-4" />
                      Create pull request
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
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
                        onClick={() => navigate(`/${username}/${reponame}/commit/${commit.hash}`)}
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
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default CompareCommitPage;
