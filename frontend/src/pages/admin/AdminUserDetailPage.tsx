import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import AdminLayout from '../../types/common/Layout/Admin/AdminLayout';
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
    <AdminLayout>
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
                    <h3 className="text-white font-semibold text-sm mb-5">Account Management</h3>

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
    </AdminLayout>
  );
};

export default AdminUserDetailPage;
