import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import AdminLayout from '../../types/common/Layout/Admin/AdminLayout';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { blockRepoThunk, unblockRepoThunk, getRepoThunk } from '../../features/admin/getRepoThunk';
import {
  selectAdminRepos,
  selectAdminReposLoading,
  selectAdminReposError,
  selectAdminSelectedRepo,
} from '../../features/admin/adminRepoSelectors';

const statusColors: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400 border border-green-500/30',
  blocked: 'bg-red-500/20 text-red-400 border border-red-500/30',
};

/** GitHub-inspired language colors */
const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Ruby: '#701516',
  Java: '#b07219',
  Kotlin: '#A97BFF',
  Go: '#00ADD8',
  Rust: '#dea584',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Swift: '#F05138',
  PHP: '#4F5D95',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Sass: '#a53b70',
  Less: '#1d365d',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  JSON: '#a3a3a3',
  YAML: '#cb171e',
  XML: '#0060ac',
  Markdown: '#083fa1',
  MDX: '#fcb32c',
  SQL: '#e38c00',
  Shell: '#89e051',
  PowerShell: '#012456',
  Dart: '#00B4AB',
  R: '#198CE7',
  Lua: '#000080',
  Elixir: '#6e4a7e',
  Erlang: '#B83998',
  Scala: '#c22d40',
  Haskell: '#5e5086',
  Perl: '#0298c3',
  Dockerfile: '#384d54',
};
const FALLBACK_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
];

/** Format bytes into a human-readable string (e.g. 1.2 MB) */
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
};

const AdminRepositoryDetailPage = React.memo(() => {
  const { id } = useParams();
  const dispatch = useAppDispatch();

  const repos = useAppSelector(selectAdminRepos);
  const selectedRepo = useAppSelector(selectAdminSelectedRepo);
  const isLoading = useAppSelector(selectAdminReposLoading);
  const error = useAppSelector(selectAdminReposError);

  // Always fetch fresh data for the detail view to get branchCount & storageBytes
  useEffect(() => {
    if (id) {
      dispatch(getRepoThunk(id));
    }
  }, [id, dispatch]);

  // Use selectedRepo (has branchCount/storageBytes), fallback to list item
  const repo = useMemo(
    () => (selectedRepo?.id === id ? selectedRepo : repos.find((r) => r.id === id)) ?? null,
    [selectedRepo, repos, id],
  );

  const [pendingBlocked, setPendingBlocked] = useState<boolean | null>(null);

  useEffect(() => {
    if (repo) {
      setPendingBlocked(repo.isBlocked);
    }
  }, [repo]);

  const status = useMemo(() => (repo?.isBlocked ? 'blocked' : 'active'), [repo?.isBlocked]);

  const stats = useMemo(
    () =>
      repo
        ? [
            { label: 'Total Stars', value: repo.stars || 0, color: 'text-amber-400' },
            { label: 'Total Forks', value: repo.forks || 0, color: 'text-blue-400' },
            {
              label: 'Branches',
              value: repo.branchCount !== undefined ? `${repo.branchCount} active` : '—',
              color: 'text-purple-400',
            },
            {
              label: 'Storage',
              value:
                repo.storageBytes !== undefined
                  ? formatBytes(repo.storageBytes)
                  : `${repo.size} KB`,
              color: 'text-cyan-400',
            },
          ]
        : [],
    [repo],
  );

  if (isLoading && !repo) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-10 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Repository not found or has been deleted.</p>
        <Link to={ROUTES.ADMIN_REPOS} className="text-blue-400 hover:underline">
          ← Back to Repositories
        </Link>
      </div>
    );
  }

  return (
    <AdminLayout>
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <Link
          to={ROUTES.ADMIN_REPOS}
          className="text-blue-400 hover:underline text-xs mb-3 inline-block font-medium"
        >
          ← Back to Repositories
        </Link>
        <h1 className="text-white text-xl xs:text-2xl font-black">Repository Detail</h1>
        <p className="text-gray-500 text-xs mt-0.5">Comprehensive audit and governance control.</p>
      </div>

      <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 xs:gap-5 mb-6 xs:mb-8 bg-gray-900/40 p-4 xs:p-5 sm:p-6 rounded-2xl xs:rounded-3xl border border-gray-800/50 shadow-sm">
        <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-xl xs:rounded-2xl bg-gray-800 flex items-center justify-center text-gray-400 ring-1 ring-gray-700 shadow-inner shrink-0">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 xs:gap-3">
            <h2 className="text-white text-lg xs:text-xl sm:text-2xl font-black tracking-tight break-words">
              {repo.name}
            </h2>
            <span
              className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter ${statusColors[status]}`}
            >
              {status}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            Primary Owner:{' '}
            <span className="text-blue-400 font-bold break-all">@{repo.ownerUsername}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-gray-900 border border-gray-800 rounded-xl xs:rounded-2xl p-3 xs:p-4"
              >
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">
                  {s.label}
                </p>
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Languages Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl xs:rounded-3xl p-4 xs:p-5 sm:p-6">
            <h3 className="text-white font-bold text-sm mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
              Tech Stack / Languages
            </h3>
            {repo.languages && repo.languages.length > 0 ? (
              <>
                {/* Stacked language bar */}
                <div className="flex h-2.5 rounded-full overflow-hidden mb-4 bg-gray-800">
                  {repo.languages.map((lang, i) => (
                    <div
                      key={lang.name}
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${lang.percentage}%`,
                        backgroundColor:
                          LANG_COLORS[lang.name] || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
                      }}
                      title={`${lang.name} ${lang.percentage}%`}
                    />
                  ))}
                </div>
                {/* Language pills */}
                <div className="flex flex-wrap gap-2">
                  {repo.languages.map((lang, i) => (
                    <span
                      key={lang.name}
                      className="flex items-center gap-1.5 bg-gray-850 px-3 py-1.5 rounded-xl border border-gray-800 text-gray-300 text-xs font-medium"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            LANG_COLORS[lang.name] || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
                        }}
                      />
                      {lang.name} ({lang.percentage}%)
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-600 text-sm italic">No language data available.</p>
            )}
          </div>

          {/* Metadata Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl xs:rounded-3xl p-4 xs:p-5 sm:p-6">
            <h3 className="text-white font-bold text-sm mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-cyan-500 rounded-full"></span>
              Registry Metadata
            </h3>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 xs:gap-6 mb-4 xs:mb-6">
              <div>
                <label className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em] block mb-2">
                  Access Type
                </label>
                <div className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm capitalize font-bold break-words">
                  {repo.visibility}
                </div>
              </div>
              <div>
                <label className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em] block mb-2">
                  Root Branch
                </label>
                <div className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm font-mono break-all">
                  {repo.defaultBranch}
                </div>
              </div>
            </div>
            <div>
              <label className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em] block mb-2">
                Description
              </label>
              <div className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-4 text-gray-400 text-sm italic leading-relaxed min-h-[80px] break-words">
                {repo.description || 'Official source code for VersionVault repository system.'}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Controls */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl xs:rounded-3xl p-4 xs:p-5 sm:p-6 sticky top-0">
            <h3 className="text-white font-bold text-sm mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-red-500 rounded-full"></span>
              Governance Controls
            </h3>

            <div className="bg-gray-950 border border-gray-800 rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-5 mb-4 xs:mb-6">
              <p className="text-white text-sm font-bold">Suspension Lock</p>
              <p className="text-gray-500 text-[11px] mt-2 leading-relaxed">
                {pendingBlocked
                  ? 'The repository is currently hidden from the platform index and locked. Restoring it will re-enable all user endpoints.'
                  : 'The repository is currently fully indexed and active on the platform. Enabling the block will restrict all Git and API access.'}
              </p>

              <button
                onClick={() => setPendingBlocked(!pendingBlocked)}
                className={`w-full py-2.5 mt-4 rounded-xl text-[10px] font-black tracking-widest transition-all duration-300 border ${pendingBlocked ? 'border-green-500/50 text-green-400 hover:bg-green-500/10' : 'border-red-500/50 text-red-400 hover:bg-red-500/10'}`}
              >
                {pendingBlocked ? 'STAGE UNBLOCK ACTION' : 'STAGE BLOCK ACTION'}
              </button>
            </div>

            <button
              onClick={async () => {
                if (pendingBlocked === repo.isBlocked) return;
                if (pendingBlocked) await dispatch(blockRepoThunk(repo.id));
                else await dispatch(unblockRepoThunk(repo.id));
              }}
              disabled={pendingBlocked === repo.isBlocked}
              className={`w-full py-4 rounded-2xl text-xs font-black tracking-[0.2em] transition-all duration-300 ${pendingBlocked !== repo.isBlocked ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-900/20' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
            >
              SAVE SYSTEM STATE
            </button>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl xs:rounded-3xl p-4 xs:p-5 sm:p-7">
            <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              Registry Trace
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 text-[9px] font-black">UNIQUE ID</p>
                <code className="text-blue-500/70 text-[10px] font-mono mt-1 block break-all">
                  {repo.id}
                </code>
              </div>
              <div>
                <p className="text-gray-600 text-[9px] font-black">REGISTRATION DATE</p>
                <p className="text-gray-400 text-xs mt-1 font-bold">
                  {repo.createdAt ? new Date(repo.createdAt).toDateString() : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
});

export default AdminRepositoryDetailPage;
