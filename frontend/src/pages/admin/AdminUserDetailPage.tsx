import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  getUserByIdThunk,
  blockUserThunk,
  unBlockUserThunk,
} from '../../features/admin/getUsersThunk';
import {
  selectAdminLoading,
  selectAdminError,
  selectSelectedUser,
} from '../../features/admin/adminSelectors';
import { getAllRepoThunk } from 'src/features/admin/getRepoThunk';
import { selectAdminRepos } from 'src/features/admin/adminRepoSelectors';
import { UserResponseDTO } from '../../types/admin/adminTypes';

const statusColors: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400 border border-green-500/30',
  blocked: 'bg-red-500/20 text-red-400 border border-red-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
};

const AdminUserDetailPage = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams();
  const isLoading = useAppSelector(selectAdminLoading);
  const error = useAppSelector(selectAdminError);
  const selectedUser = useAppSelector(selectSelectedUser);
  const userRepos = useAppSelector(selectAdminRepos);

  const [pendingBlocked, setPendingBlocked] = useState<boolean | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(getUserByIdThunk(id));
    }
  }, [id, dispatch]);
  useEffect(() => {
    if (selectedUser) {
      setPendingBlocked(selectedUser.isBlocked);
    }
  }, [selectedUser]);
  useEffect(() => {
    if (selectedUser?.username) {
      dispatch(
        getAllRepoThunk({
          search: selectedUser.userId,
          limit: 5,
        }),
      );
    }
  }, [selectedUser?.userId, dispatch]);

  const getStatus = (user: UserResponseDTO) => {
    if (user.isBlocked) return 'blocked';
    if (!user.isVerified) return 'pending';
    return 'active';
  };

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
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white text-sm transition"
          >
            Overview
          </Link>
          <Link
            to={ROUTES.ADMIN_USERS}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm"
          >
            User Management
          </Link>
          <Link
            to={ROUTES.ADMIN_REPOS}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white text-sm transition"
          >
            Repository Management
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
          <div className="relative">
            <input
              type="text"
              placeholder="Search or jump to..."
              className="bg-gray-900 border border-gray-700 rounded-lg pl-4 pr-16 py-1.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none w-64 transition"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs border border-gray-700 rounded px-1">
              ⌘K
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          {!isLoading &&
            selectedUser &&
            (() => {
              const status = getStatus(selectedUser);
              return (
                <>
                  {/* Page Header */}
                  <div className="mb-6">
                    <Link
                      to={ROUTES.ADMIN_USERS}
                      className="text-blue-400 hover:underline text-xs mb-3 inline-block"
                    >
                      ← Back to Users
                    </Link>
                    <h1 className="text-white text-xl font-bold">User Management</h1>
                    <p className="text-gray-500 text-sm mt-1">
                      Manage platform access, roles, and repository permissions for all users.
                    </p>
                  </div>

                  {/* User Identity Bar */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                      {selectedUser.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-white text-lg font-bold">{selectedUser.username}</h2>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${statusColors[status]}`}
                        >
                          {status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs">
                        System User ID:{' '}
                        <span className="bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded text-[10px] font-mono">
                          {selectedUser.userId}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Two Column Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left Column - 3/5 */}
                    <div className="lg:col-span-3 space-y-6">
                      {/* User Details Card */}
                      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-white font-semibold text-sm mb-5">User Details</h3>
                        <div className="grid grid-cols-2 gap-4 mb-5">
                          <div>
                            <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">
                              Display Name
                            </label>
                            <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm">
                              {selectedUser.username}
                            </div>
                          </div>
                          <div>
                            <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">
                              Email Address
                            </label>
                            <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm">
                              {selectedUser.email}
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">
                            Bio
                          </label>
                          <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-gray-400 text-sm min-h-[80px]">
                            {selectedUser.bio || 'No bio provided.'}
                          </div>
                        </div>
                      </div>

                      {/* Recent Repositories Card */}
                      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-white font-semibold text-sm">User Repositories</h3>
                          <Link
                            to={`${ROUTES.ADMIN_REPOS}?search=${selectedUser.userId}`}
                            className="text-blue-400 text-xs hover:underline"
                          >
                            View All
                          </Link>
                        </div>
                        <table className="w-full">
                          <thead>
                            <tr className="text-gray-500 text-xs border-b border-gray-800">
                              <th className="text-left pb-2.5 font-medium">Repository Name</th>
                              <th className="text-center pb-2.5 font-medium">Visibility</th>
                              <th className="text-right pb-2.5 font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userRepos && userRepos.length > 0 ? (
                              userRepos.map((repo) => (
                                <tr
                                  key={repo.id}
                                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition"
                                >
                                  <td className="py-3">
                                    <Link
                                      to={`/admin/repositories/${repo.id}`}
                                      className="text-white text-sm font-medium hover:text-blue-400"
                                    >
                                      {repo.name}
                                    </Link>
                                  </td>
                                  <td className="py-3 text-center">
                                    <span className="text-gray-400 text-[10px] uppercase bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                                      {repo.visibility}
                                    </span>
                                  </td>
                                  <td className="py-3 text-right">
                                    <span
                                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${repo.isBlocked ? 'text-red-400 bg-red-400/10' : 'text-green-400 bg-green-400/10'}`}
                                    >
                                      {repo.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  className="py-6 text-gray-500 text-sm italic text-center"
                                  colSpan={3}
                                >
                                  No repositories found for this user.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Right Column - 2/5 */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Account Management Card */}
                      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-white font-semibold text-sm mb-5">
                          Account Management
                        </h3>

                        <div className="mb-5">
                          <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1.5">
                            User Role
                          </label>
                          <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm capitalize flex items-center justify-between">
                            <span>
                              {selectedUser.role === 'admin' ? 'Administrator' : 'Standard Member'}
                            </span>
                            <svg
                              className="w-4 h-4 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                          <p className="text-gray-600 text-xs mt-1.5">
                            Determines system-wide permissions and API limits.
                          </p>
                        </div>

                        <div className="border-t border-gray-800 pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white text-sm font-medium">Suspend Account</p>
                              <p className="text-gray-500 text-xs">
                                {selectedUser.isBlocked
                                  ? 'Restore access immediately'
                                  : 'Revoke all access immediately'}
                              </p>
                            </div>
                            {pendingBlocked ? (
                              <button
                                onClick={() => setPendingBlocked(false)}
                                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition"
                              >
                                Unblock
                              </button>
                            ) : (
                              <button
                                onClick={() => setPendingBlocked(true)}
                                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition"
                              >
                                Block
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick Stats Card */}
                      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-4">
                          Quick Stats
                        </h3>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-gray-800 rounded-lg p-3">
                            <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">
                              Commits
                            </p>
                            <p className="text-white text-lg font-bold">—</p>
                          </div>
                          <div className="bg-gray-800 rounded-lg p-3">
                            <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">
                              Joined
                            </p>
                            <p className="text-white text-sm font-bold">
                              {selectedUser.createdAt
                                ? new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : '—'}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-gray-500 text-[10px] uppercase tracking-wider">
                              Account Health
                            </p>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-green-400"
                              style={{
                                width: selectedUser.isVerified
                                  ? selectedUser.isBlocked
                                    ? '40%'
                                    : '92%'
                                  : '20%',
                              }}
                            />
                          </div>
                          <p className="text-cyan-400 text-xs text-right mt-1">
                            {selectedUser.isVerified
                              ? selectedUser.isBlocked
                                ? '40% Compliance'
                                : '92% Compliance'
                              : '20% Compliance'}
                          </p>
                        </div>

                        <button
                          onClick={async () => {
                            if (!selectedUser || pendingBlocked === null) return;
                            if (pendingBlocked !== selectedUser.isBlocked) {
                              if (pendingBlocked) {
                                await dispatch(blockUserThunk(selectedUser.id));
                              } else {
                                await dispatch(unBlockUserThunk(selectedUser.id));
                              }
                            }
                          }}
                          disabled={pendingBlocked === selectedUser.isBlocked}
                          className={`w-full text-white text-sm font-medium py-2.5 rounded-lg transition ${
                            pendingBlocked !== selectedUser.isBlocked
                              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'
                              : 'bg-gray-800 cursor-not-allowed opacity-50'
                          }`}
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
        </main>

        <footer className="border-t border-gray-800 py-3 px-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-gray-600 text-xs">LIVE UPDATES</span>
        </footer>
      </div>
    </div>
  );
};

export default AdminUserDetailPage;
