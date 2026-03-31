import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import AdminLayout from '../../types/common/Layout/Admin/AdminLayout';
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
        <h1 className="text-white text-2xl font-black">Repository Detail</h1>
        <p className="text-gray-500 text-xs mt-0.5">Comprehensive audit and governance control.</p>
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
            Primary Owner: <span className="text-blue-400 font-bold">@{repo.ownerUsername}</span>
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
    </AdminLayout>
  );
};

export default AdminRepositoryDetailPage;
