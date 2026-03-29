import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { blockRepoThunk, unblockRepoThunk, getRepoThunk } from '../../features/admin/getRepoThunk';
import {
  selectAdminRepos,
  selectAdminReposLoading,
  selectAdminReposError,
} from '../../features/admin/adminRepoSelectors';

const statusColors: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400 border border-green-500/30',
  blocked: 'bg-red-500/20 text-red-400 border border-red-500/30',
};

const AdminRepositoryDetailPage = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();

  const repos = useAppSelector(selectAdminRepos);
  const isLoading = useAppSelector(selectAdminReposLoading);
  const error = useAppSelector(selectAdminReposError);

  const repo = repos.find((r) => r.id === id);
  const [pendingBlocked, setPendingBlocked] = useState<boolean | null>(null);

  useEffect(() => {
    if (!repo && id) {
      dispatch(getRepoThunk(id));
    }
  }, [id, repo, dispatch]);

  useEffect(() => {
    if (repo) {
      setPendingBlocked(repo.isBlocked);
    }
  }, [repo]);

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

  const status = repo.isBlocked ? 'blocked' : 'active';

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-44 shrink-0 border-r border-gray-800 flex flex-col py-4">
        <div className="px-4 mb-6 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </div>
          <span className="text-white font-bold text-sm">VersionVault</span>
        </div>
        <nav className="flex flex-col gap-1 px-2">
          <Link
            to={ROUTES.ADMIN_DASHBOARD}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white text-sm transition text-left"
          >
            Overview
          </Link>
          <Link
            to={ROUTES.ADMIN_USERS}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white text-sm transition text-left"
          >
            User Management
          </Link>
          <Link
            to={ROUTES.ADMIN_REPOS}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm text-left font-medium"
          >
            Repository Management
          </Link>
        </nav>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search or jump to..."
              className="bg-gray-900 border border-gray-700 rounded-lg pl-4 pr-16 py-1.5 text-sm text-gray-300 w-64 focus:outline-none"
            />
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
            A
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
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
            <h1 className="text-white text-2xl font-black">Repository Detail</h1>
            <p className="text-gray-500 text-xs mt-0.5">
              Comprehensive audit and governance control.
            </p>
          </div>

          {/* Header Bar */}
          <div className="flex items-center gap-5 mb-8 bg-gray-900/40 p-6 rounded-3xl border border-gray-800/50 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center text-gray-400 ring-1 ring-gray-700 shadow-inner">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-white text-2xl font-black tracking-tight">{repo.name}</h2>
                <span
                  className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter ${statusColors[status]}`}
                >
                  {status}
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-0.5">
                Primary Owner:{' '}
                <span className="text-blue-400 font-bold">@{repo.ownerUsername}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-6">
              {/* Stats Bar */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Total Stars', value: repo.stars || 0, color: 'text-amber-400' },
                  { label: 'Total Forks', value: repo.forks || 0, color: 'text-blue-400' },
                  { label: 'Branches', value: '4 active', color: 'text-purple-400' }, // New Stat
                  { label: 'Storage', value: `${repo.size} KB`, color: 'text-cyan-400' },
                ].map((s) => (
                  <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">
                      {s.label}
                    </p>
                    <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Languages Section */}
              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
                <h3 className="text-white font-bold text-sm mb-6 flex items-center gap-2">
                  <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                  Tech Stack / Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {/* Mocked for now, usually calculated by backend */}
                  {['TypeScript (78%)', 'CSS (12%)', 'HTML (10%)'].map((lang) => (
                    <span
                      key={lang}
                      className="bg-gray-850 px-3 py-1.5 rounded-xl border border-gray-800 text-gray-300 text-xs font-medium"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metadata Card */}
              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
                <h3 className="text-white font-bold text-sm mb-6 flex items-center gap-2">
                  <span className="w-1 h-4 bg-cyan-500 rounded-full"></span>
                  Registry Metadata
                </h3>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em] block mb-2">
                      Access Type
                    </label>
                    <div className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm capitalize font-bold">
                      {repo.visibility}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em] block mb-2">
                      Root Branch
                    </label>
                    <div className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm font-mono">
                      {repo.defaultBranch}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em] block mb-2">
                    Description
                  </label>
                  <div className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-4 text-gray-400 text-sm italic leading-relaxed min-h-[80px]">
                    {repo.description || 'Official source code for VersionVault repository system.'}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {/* Controls */}
              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sticky top-0">
                <h3 className="text-white font-bold text-sm mb-6 flex items-center gap-2">
                  <span className="w-1 h-4 bg-red-500 rounded-full"></span>
                  Governance Controls
                </h3>

                <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5 mb-6">
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

              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-7">
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
        </main>
      </div>
    </div>
  );
};

export default AdminRepositoryDetailPage;
